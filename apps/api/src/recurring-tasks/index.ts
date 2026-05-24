import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import * as v from "valibot";
import { recurringTaskSchema } from "../schemas";
import createRecurringTask from "./controllers/create-recurring-task";
import deleteRecurringTask from "./controllers/delete-recurring-task";
import listRecurringTasks from "./controllers/list-recurring-tasks";
import updateRecurringTask from "./controllers/update-recurring-task";

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
			}),
		),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const task = await createRecurringTask({
				projectId,
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
			}),
		),
		async (c) => {
			const { recurringTaskId } = c.req.valid("param");
			const { nextRunAt, ...rest } = c.req.valid("json");
			const task = await updateRecurringTask(recurringTaskId, {
				...rest,
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
			const task = await deleteRecurringTask(recurringTaskId);
			return c.json(task);
		},
	);

export default recurringTasks;
