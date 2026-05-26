import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import * as v from "valibot";
import { recurringTaskSchema } from "../schemas";
import createChecklistItem from "./controllers/create-checklist-item";
import createRecurringTask from "./controllers/create-recurring-task";
import deleteChecklistItem from "./controllers/delete-checklist-item";
import deleteRecurringTask from "./controllers/delete-recurring-task";
import listChecklistItems from "./controllers/list-checklist-items";
import listRecurringTasks from "./controllers/list-recurring-tasks";
import updateRecurringTask from "./controllers/update-recurring-task";

const checklistItemSchema = v.object({
	id: v.string(),
	text: v.string(),
	position: v.number(),
});

const recurringTasks = new Hono<{ Variables: { userId: string } }>()
	.get(
		"/:projectId",
		describeRoute({
			operationId: "listRecurringTasks",
			tags: ["RecurringTasks"],
			description: "List recurring tasks for a project",
		}),
		validator("param", v.object({ projectId: v.string() })),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const tasks = await listRecurringTasks(projectId);
			return c.json(tasks);
		},
	)
	.post(
		"/:projectId",
		describeRoute({
			operationId: "createRecurringTask",
			tags: ["RecurringTasks"],
			description: "Create a new recurring task",
			responses: {
				201: {
					content: {
						"application/json": {
							schema: recurringTaskSchema,
						},
					},
					description: "Created recurring task",
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				title: v.string(),
				description: v.optional(v.string()),
				frequency: v.optional(v.string()),
				intervalValue: v.optional(v.number()),
				dayOfWeek: v.optional(v.number()),
				dayOfMonth: v.optional(v.number()),
				cronExpression: v.optional(v.string()),
				nextRunAt: v.string(),
				isActive: v.optional(v.boolean()),
				columnId: v.optional(v.string()),
				assigneeId: v.optional(v.string()),
				priority: v.optional(v.string()),
				dueDateDaysOffset: v.optional(v.number()),
				labelIds: v.optional(v.array(v.string())),
				checklistItems: v.optional(
					v.array(
						v.object({
							text: v.string(),
							position: v.number(),
						}),
					),
				),
			}),
		),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const userId = c.get("userId");
			const task = await createRecurringTask({
				projectId,
				createdBy: userId,
				...body,
				nextRunAt: new Date(body.nextRunAt),
			});
			return c.json(task, 201);
		},
	)
	.put(
		"/:projectId/:recurringTaskId",
		describeRoute({
			operationId: "updateRecurringTask",
			tags: ["RecurringTasks"],
			description: "Update a recurring task",
		}),
		validator(
			"param",
			v.object({
				projectId: v.string(),
				recurringTaskId: v.string(),
			}),
		),
		validator(
			"json",
			v.object({
				title: v.optional(v.string()),
				description: v.optional(v.nullable(v.string())),
				frequency: v.optional(v.string()),
				intervalValue: v.optional(v.number()),
				dayOfWeek: v.optional(v.nullable(v.number())),
				dayOfMonth: v.optional(v.nullable(v.number())),
				cronExpression: v.optional(v.nullable(v.string())),
				nextRunAt: v.optional(v.string()),
				isActive: v.optional(v.boolean()),
				columnId: v.optional(v.nullable(v.string())),
				assigneeId: v.optional(v.nullable(v.string())),
				priority: v.optional(v.nullable(v.string())),
				dueDateDaysOffset: v.optional(v.nullable(v.number())),
				labelIds: v.optional(v.nullable(v.array(v.string()))),
				checklistItems: v.optional(
					v.array(
						v.object({
							text: v.string(),
							position: v.number(),
						}),
					),
				),
			}),
		),
		async (c) => {
			const { recurringTaskId } = c.req.valid("param");
			const { nextRunAt, ...rest } = c.req.valid("json");
			const userId = c.get("userId");
			const task = await updateRecurringTask(recurringTaskId, {
				...rest,
				userId,
				...(nextRunAt && { nextRunAt: new Date(nextRunAt) }),
			});
			return c.json(task);
		},
	)
	.delete(
		"/:projectId/:recurringTaskId",
		describeRoute({
			operationId: "deleteRecurringTask",
			tags: ["RecurringTasks"],
			description: "Delete a recurring task",
		}),
		validator(
			"param",
			v.object({
				projectId: v.string(),
				recurringTaskId: v.string(),
			}),
		),
		async (c) => {
			const { recurringTaskId } = c.req.valid("param");
			const userId = c.get("userId");
			const task = await deleteRecurringTask(recurringTaskId, userId);
			return c.json(task);
		},
	)
	.get(
		"/:projectId/:recurringTaskId/checklist-items",
		describeRoute({
			operationId: "listChecklistItems",
			tags: ["RecurringTasks"],
			description: "List checklist items for a recurring task",
		}),
		validator(
			"param",
			v.object({
				projectId: v.string(),
				recurringTaskId: v.string(),
			}),
		),
		async (c) => {
			const { recurringTaskId } = c.req.valid("param");
			const items = await listChecklistItems(recurringTaskId);
			return c.json(items);
		},
	)
	.post(
		"/:projectId/:recurringTaskId/checklist-items",
		describeRoute({
			operationId: "createChecklistItem",
			tags: ["RecurringTasks"],
			description: "Add a checklist item to a recurring task",
			responses: {
				201: {
					content: {
						"application/json": {
							schema: checklistItemSchema,
						},
					},
					description: "Created checklist item",
				},
			},
		}),
		validator(
			"param",
			v.object({
				projectId: v.string(),
				recurringTaskId: v.string(),
			}),
		),
		validator(
			"json",
			v.object({
				text: v.string(),
				position: v.number(),
			}),
		),
		async (c) => {
			const { recurringTaskId } = c.req.valid("param");
			const body = c.req.valid("json");
			const item = await createChecklistItem({
				recurringTaskId,
				text: body.text,
				position: body.position,
			});
			return c.json(item, 201);
		},
	)
	.delete(
		"/:projectId/:recurringTaskId/checklist-items/:checklistItemId",
		describeRoute({
			operationId: "deleteChecklistItem",
			tags: ["RecurringTasks"],
			description: "Delete a checklist item",
		}),
		validator(
			"param",
			v.object({
				projectId: v.string(),
				recurringTaskId: v.string(),
				checklistItemId: v.string(),
			}),
		),
		async (c) => {
			const { checklistItemId } = c.req.valid("param");
			const item = await deleteChecklistItem(checklistItemId);
			return c.json(item);
		},
	);

export default recurringTasks;
