import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import db from "../database";
import { projectTable, taskTable } from "../database/schema";
import { subscribeToEvent } from "../events";
import { notificationSchema } from "../schemas";
import clearNotifications from "./controllers/clear-notifications";
import createNotification from "./controllers/create-notification";
import getNotifications from "./controllers/get-notifications";
import markAllNotificationsAsRead from "./controllers/mark-all-notifications-as-read";
import markAsRead from "./controllers/mark-notification-as-read";
import { workspaceMemberQueryAdapter } from "./infrastructure/adapters/drizzle-workspace-member-query.adapter";
import { retryFailedDelivery } from "./infrastructure/delivery/delivery";

const bulkResultSchema = v.object({
	success: v.boolean(),
	count: v.optional(v.number()),
});

const notification = new Hono<{
	Variables: {
		userId: string;
	};
}>()
	.get(
		"/",
		describeRoute({
			operationId: "listNotifications",
			tags: ["Notifications"],
			description: "Get all notifications for the current user",
			responses: {
				200: {
					description: "List of notifications",
					content: {
						"application/json": {
							schema: resolver(v.array(notificationSchema)),
						},
					},
				},
			},
		}),
		async (c) => {
			const userId = c.get("userId");
			const notifications = await getNotifications(userId);
			return c.json(notifications);
		},
	)
	.post(
		"/",
		describeRoute({
			operationId: "createNotification",
			tags: ["Notifications"],
			description: "Create a new notification for a user",
			responses: {
				200: {
					description: "Notification created successfully",
					content: {
						"application/json": { schema: resolver(notificationSchema) },
					},
				},
			},
		}),
		validator(
			"json",
			v.object({
				title: v.optional(v.nullable(v.string())),
				message: v.optional(v.nullable(v.string())),
				type: v.string(),
				eventData: v.optional(v.nullable(v.record(v.string(), v.unknown()))),
				relatedEntityId: v.optional(v.string()),
				relatedEntityType: v.optional(v.string()),
			}),
		),
		async (c) => {
			const {
				title,
				message,
				type,
				eventData,
				relatedEntityId,
				relatedEntityType,
			} = c.req.valid("json");
			const userId = c.get("userId");
			const notification = await createNotification({
				userId,
				title,
				content: message,
				type,
				eventData,
				resourceId: relatedEntityId,
				resourceType: relatedEntityType,
			});
			return c.json(notification);
		},
	)
	.patch(
		"/:id/read",
		describeRoute({
			operationId: "markNotificationAsRead",
			tags: ["Notifications"],
			description: "Mark a specific notification as read",
			responses: {
				200: {
					description: "Notification marked as read",
					content: {
						"application/json": { schema: resolver(notificationSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ id: v.string() })),
		async (c) => {
			const { id } = c.req.valid("param");
			const userId = c.get("userId");
			const notification = await markAsRead(id, userId);
			return c.json(notification);
		},
	)
	.patch(
		"/read-all",
		describeRoute({
			operationId: "markAllNotificationsAsRead",
			tags: ["Notifications"],
			description: "Mark all notifications as read for the current user",
			responses: {
				200: {
					description: "All notifications marked as read",
					content: {
						"application/json": { schema: resolver(bulkResultSchema) },
					},
				},
			},
		}),
		async (c) => {
			const userId = c.get("userId");
			const result = await markAllNotificationsAsRead(userId);
			return c.json(result);
		},
	)
	.post(
		"/:id/retry",
		describeRoute({
			operationId: "retryNotificationDelivery",
			tags: ["Notifications"],
			description: "Retry delivery of a failed notification",
			responses: {
				200: {
					description: "Delivery retry initiated",
					content: {
						"application/json": {
							schema: resolver(v.object({ success: v.boolean() })),
						},
					},
				},
			},
		}),
		validator("param", v.object({ id: v.string() })),
		async (c) => {
			const { id } = c.req.valid("param");
			await retryFailedDelivery(id);
			return c.json({ success: true });
		},
	)
	.delete(
		"/clear-all",
		describeRoute({
			operationId: "clearAllNotifications",
			tags: ["Notifications"],
			description: "Clear all notifications for the current user",
			responses: {
				200: {
					description: "All notifications cleared",
					content: {
						"application/json": { schema: resolver(bulkResultSchema) },
					},
				},
			},
		}),
		async (c) => {
			const userId = c.get("userId");
			const result = await clearNotifications(userId);
			return c.json(result);
		},
	);

subscribeToEvent<{
	taskId: string;
	userId: string;
	assigneeId: string | null;
	title: string;
	projectId: string;
}>("task.created", async (data) => {
	if (data.userId) {
		const [project] = await db
			.select({ workspaceId: projectTable.workspaceId })
			.from(projectTable)
			.where(eq(projectTable.id, data.projectId))
			.limit(1);

		await createNotification({
			userId: data.assigneeId,
			type: "task_created",
			eventData: {
				taskTitle: data.title,
				projectId: data.projectId,
				workspaceId: project?.workspaceId ?? null,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	workspaceId: string;
	workspaceName: string;
	ownerEmail: string;
	ownerId?: string;
}>("workspace.created", async (data) => {
	if (data.ownerId) {
		await createNotification({
			userId: data.ownerId,
			type: "workspace_created",
			eventData: {
				workspaceName: data.workspaceName,
			},
			resourceId: data.workspaceId,
			resourceType: "workspace",
		});
	}
});

subscribeToEvent<{
	taskId: string;
	userId: string;
	oldStatus: string;
	newStatus: string;
	title: string;
	assigneeId?: string;
}>("task.status_changed", async (data) => {
	if (data.assigneeId && data.assigneeId !== data.userId) {
		const [task] = await db
			.select({ projectId: taskTable.projectId })
			.from(taskTable)
			.where(eq(taskTable.id, data.taskId))
			.limit(1);

		const [project] = task
			? await db
					.select({ workspaceId: projectTable.workspaceId })
					.from(projectTable)
					.where(eq(projectTable.id, task.projectId))
					.limit(1)
			: [];

		await createNotification({
			userId: data.assigneeId,
			type: "task_status_changed",
			eventData: {
				taskTitle: data.title,
				oldStatus: data.oldStatus,
				newStatus: data.newStatus,
				projectId: task?.projectId ?? null,
				workspaceId: project?.workspaceId ?? null,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	taskId: string;
	userId: string;
	oldAssignee: string | null;
	newAssignee: string;
	newAssigneeId: string;
	title: string;
}>("task.assignee_changed", async (data) => {
	if (data.newAssigneeId) {
		const [task] = await db
			.select({ projectId: taskTable.projectId })
			.from(taskTable)
			.where(eq(taskTable.id, data.taskId))
			.limit(1);

		const [project] = task
			? await db
					.select({ workspaceId: projectTable.workspaceId })
					.from(projectTable)
					.where(eq(projectTable.id, task.projectId))
					.limit(1)
			: [];

		await createNotification({
			userId: data.newAssigneeId,
			type: "task_assignee_changed",
			eventData: {
				taskTitle: data.title,
				projectId: task?.projectId ?? null,
				workspaceId: project?.workspaceId ?? null,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	timeEntryId: string;
	taskId: string;
	userId: string;
	taskOwnerId?: string;
	taskTitle?: string;
}>("time-entry.created", async (data) => {
	if (data.taskOwnerId && data.taskOwnerId !== data.userId) {
		const [task] = await db
			.select({ projectId: taskTable.projectId })
			.from(taskTable)
			.where(eq(taskTable.id, data.taskId))
			.limit(1);

		const [project] = task
			? await db
					.select({ workspaceId: projectTable.workspaceId })
					.from(projectTable)
					.where(eq(projectTable.id, task.projectId))
					.limit(1)
			: [];

		await createNotification({
			userId: data.taskOwnerId,
			type: "time_entry_created",
			eventData: {
				taskTitle: data.taskTitle ?? null,
				projectId: task?.projectId ?? null,
				workspaceId: project?.workspaceId ?? null,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	userId: string;
	type: string;
	eventData: Record<string, unknown>;
	resourceId: string;
	resourceType: string;
}>("due_date_reminder.due", async (data) => {
	if (data.userId) {
		await createNotification({
			userId: data.userId,
			type: data.type,
			eventData: data.eventData,
			resourceId: data.resourceId,
			resourceType: data.resourceType,
		});
	}
});

subscribeToEvent<{
	taskId: string;
	projectId: string;
	userId: string;
	comment: string;
	content: string;
	assigneeId: string | null;
	taskTitle: string;
}>("task.comment_created", async (data) => {
	if (data.assigneeId && data.assigneeId !== data.userId) {
		await createNotification({
			userId: data.assigneeId,
			type: "task_comment_created",
			eventData: {
				taskTitle: data.taskTitle,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	taskId: string;
	projectId: string;
	title: string;
	status: string;
	userId?: string;
	assigneeId?: string | null;
}>("task.updated", async (data) => {
	if (data.assigneeId && data.assigneeId !== data.userId) {
		await createNotification({
			userId: data.assigneeId,
			type: "task_updated",
			eventData: {
				taskTitle: data.title,
			},
			resourceId: data.taskId,
			resourceType: "task",
		});
	}
});

subscribeToEvent<{
	projectId: string;
	workspaceId: string;
	name: string;
	slug: string;
	userId?: string;
}>("project.created", async (data) => {
	if (!data.workspaceId || !data.userId) return;

	const memberIds =
		await workspaceMemberQueryAdapter.findMemberIdsByWorkspaceId(
			data.workspaceId,
		);

	for (const memberId of memberIds) {
		if (memberId !== data.userId) {
			await createNotification({
				userId: memberId,
				type: "project_created",
				eventData: {
					projectName: data.name,
				},
				resourceId: data.projectId,
				resourceType: "project",
			});
		}
	}
});

export default notification;
