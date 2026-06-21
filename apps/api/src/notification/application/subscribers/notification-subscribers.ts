import { subscribeToEvent } from "../../../events";
import createNotification from "../../controllers/create-notification";
import type { WorkspaceMemberQuery } from "../ports/workspace-member-query.port";

export function registerNotificationSubscribers(
	workspaceMemberQuery: WorkspaceMemberQuery,
): void {
	subscribeToEvent<{
		taskId: string;
		userId: string;
		assigneeId: string | null;
		title: string;
		projectId: string;
	}>("task.created", async (data) => {
		if (data.assigneeId) {
			await createNotification({
				userId: data.assigneeId,
				type: "task_created",
				eventData: {
					taskTitle: data.title,
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
			await createNotification({
				userId: data.assigneeId,
				type: "task_status_changed",
				eventData: {
					taskTitle: data.title,
					oldStatus: data.oldStatus,
					newStatus: data.newStatus,
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
			await createNotification({
				userId: data.newAssigneeId,
				type: "task_assignee_changed",
				eventData: {
					taskTitle: data.title,
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
			await createNotification({
				userId: data.taskOwnerId,
				type: "time_entry_created",
				eventData: {
					taskTitle: data.taskTitle ?? null,
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
		taskId: string;
		projectId: string;
		userId?: string;
		assigneeId?: string | null;
		title: string;
	}>("task.deleted", async (data) => {
		if (data.assigneeId && data.assigneeId !== data.userId) {
			await createNotification({
				userId: data.assigneeId,
				type: "task_deleted",
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

		const memberIds = await workspaceMemberQuery.findMemberIdsByWorkspaceId(
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
}
