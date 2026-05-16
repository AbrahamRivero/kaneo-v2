import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { slackIntegrationSchema } from "../schemas";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createSlackIntegration from "./controllers/create-slack-integration";
import deleteSlackIntegration from "./controllers/delete-slack-integration";
import getSlackIntegration from "./controllers/get-slack-integration";
import updateSlackIntegration from "./controllers/update-slack-integration";

const slackIntegration = new Hono<{
	Variables: {
		userId: string;
		workspaceId: string;
		apiKey?: {
			id: string;
			userId: string;
			enabled: boolean;
		};
	};
}>();

const nullableSlackIntegrationSchema = v.nullable(slackIntegrationSchema);

slackIntegration
	.get(
		"/project/:projectId",
		describeRoute({
			operationId: "getSlackIntegration",
			tags: ["Slack"],
			description: "Get Slack integration for a project",
			responses: {
				200: {
					description: "Slack integration details",
					content: {
						"application/json": {
							schema: resolver(nullableSlackIntegrationSchema),
						},
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const integration = await getSlackIntegration(projectId);
			return c.json(integration);
		},
	)
	.post(
		"/project/:projectId",
		describeRoute({
			operationId: "createSlackIntegration",
			tags: ["Slack"],
			description: "Create or replace a Slack integration for a project",
			responses: {
				200: {
					description: "Slack integration created successfully",
					content: {
						"application/json": { schema: resolver(slackIntegrationSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				webhookUrl: v.pipe(v.string(), v.minLength(1)),
				channelName: v.optional(v.string()),
				events: v.optional(
					v.object({
						taskCreated: v.optional(v.boolean()),
						taskStatusChanged: v.optional(v.boolean()),
						taskPriorityChanged: v.optional(v.boolean()),
						taskTitleChanged: v.optional(v.boolean()),
						taskDescriptionChanged: v.optional(v.boolean()),
						taskCommentCreated: v.optional(v.boolean()),
					}),
				),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await createSlackIntegration(projectId, body);
			return c.json(result);
		},
	)
	.patch(
		"/project/:projectId",
		describeRoute({
			operationId: "updateSlackIntegration",
			tags: ["Slack"],
			description: "Update Slack integration settings",
			responses: {
				200: {
					description: "Slack integration updated successfully",
					content: {
						"application/json": { schema: resolver(slackIntegrationSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				webhookUrl: v.optional(v.string()),
				channelName: v.optional(v.nullable(v.string())),
				isActive: v.optional(v.boolean()),
				events: v.optional(
					v.object({
						taskCreated: v.optional(v.boolean()),
						taskStatusChanged: v.optional(v.boolean()),
						taskPriorityChanged: v.optional(v.boolean()),
						taskTitleChanged: v.optional(v.boolean()),
						taskDescriptionChanged: v.optional(v.boolean()),
						taskCommentCreated: v.optional(v.boolean()),
					}),
				),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await updateSlackIntegration(projectId, body);
			return c.json(result);
		},
	)
	.delete(
		"/project/:projectId",
		describeRoute({
			operationId: "deleteSlackIntegration",
			tags: ["Slack"],
			description: "Delete Slack integration for a project",
			responses: {
				200: {
					description: "Slack integration deleted successfully",
					content: {
						"application/json": {
							schema: resolver(v.object({ success: v.boolean() })),
						},
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			await deleteSlackIntegration(projectId);
			return c.json({ success: true });
		},
	);

export default slackIntegration;
