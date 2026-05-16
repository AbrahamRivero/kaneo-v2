import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { discordIntegrationSchema } from "../schemas";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createDiscordIntegration from "./controllers/create-discord-integration";
import deleteDiscordIntegration from "./controllers/delete-discord-integration";
import getDiscordIntegration from "./controllers/get-discord-integration";
import updateDiscordIntegration from "./controllers/update-discord-integration";

const discordIntegration = new Hono<{
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

const discordEventsSchema = v.object({
	taskCreated: v.optional(v.boolean()),
	taskStatusChanged: v.optional(v.boolean()),
	taskPriorityChanged: v.optional(v.boolean()),
	taskTitleChanged: v.optional(v.boolean()),
	taskDescriptionChanged: v.optional(v.boolean()),
	taskCommentCreated: v.optional(v.boolean()),
});

const nullableDiscordIntegrationSchema = v.nullable(discordIntegrationSchema);

discordIntegration
	.get(
		"/project/:projectId",
		describeRoute({
			operationId: "getDiscordIntegration",
			tags: ["Discord"],
			description: "Get Discord integration for a project",
			responses: {
				200: {
					description: "Discord integration details",
					content: {
						"application/json": {
							schema: resolver(nullableDiscordIntegrationSchema),
						},
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const integration = await getDiscordIntegration(projectId);
			return c.json(integration);
		},
	)
	.post(
		"/project/:projectId",
		describeRoute({
			operationId: "createDiscordIntegration",
			tags: ["Discord"],
			description: "Create or replace a Discord integration for a project",
			responses: {
				200: {
					description: "Discord integration created successfully",
					content: {
						"application/json": {
							schema: resolver(discordIntegrationSchema),
						},
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
				events: v.optional(discordEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await createDiscordIntegration(projectId, body);
			return c.json(result);
		},
	)
	.patch(
		"/project/:projectId",
		describeRoute({
			operationId: "updateDiscordIntegration",
			tags: ["Discord"],
			description: "Update Discord integration settings",
			responses: {
				200: {
					description: "Discord integration updated successfully",
					content: {
						"application/json": { schema: resolver(discordIntegrationSchema) },
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
				events: v.optional(discordEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const result = await updateDiscordIntegration(projectId, body);
			return c.json(result);
		},
	)
	.delete(
		"/project/:projectId",
		describeRoute({
			operationId: "deleteDiscordIntegration",
			tags: ["Discord"],
			description: "Delete Discord integration for a project",
			responses: {
				200: {
					description: "Discord integration deleted successfully",
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
			await deleteDiscordIntegration(projectId);
			return c.json({ success: true });
		},
	);

export default discordIntegration;
