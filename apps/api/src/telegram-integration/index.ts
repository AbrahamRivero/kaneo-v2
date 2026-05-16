import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { telegramEventsSchema } from "../plugins/telegram/config";
import { telegramIntegrationSchema } from "../schemas";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createTelegramIntegration from "./controllers/create-telegram-integration";
import deleteTelegramIntegration from "./controllers/delete-telegram-integration";
import getTelegramIntegration from "./controllers/get-telegram-integration";
import updateTelegramIntegration from "./controllers/update-telegram-integration";

const telegramIntegration = new Hono<{
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

telegramIntegration
	.get(
		"/project/:projectId",
		describeRoute({
			operationId: "getTelegramIntegration",
			tags: ["Telegram"],
			description: "Get Telegram integration for a project",
			responses: {
				200: {
					description: "Telegram integration details",
					content: {
						"application/json": { schema: resolver(telegramIntegrationSchema) },
					},
				},
				404: {
					description: "Telegram integration not found",
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const integration = await getTelegramIntegration(projectId);
			return c.json(integration);
		},
	)
	.post(
		"/project/:projectId",
		describeRoute({
			operationId: "createTelegramIntegration",
			tags: ["Telegram"],
			description: "Create or replace a Telegram integration for a project",
			responses: {
				200: {
					description: "Telegram integration created successfully",
					content: {
						"application/json": { schema: resolver(telegramIntegrationSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				botToken: v.pipe(v.string(), v.minLength(1)),
				chatId: v.pipe(v.string(), v.minLength(1)),
				threadId: v.optional(v.number()),
				chatLabel: v.optional(v.string()),
				events: v.optional(telegramEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const apiKey = c.get("apiKey");
			const result = await createTelegramIntegration(
				c.get("userId"),
				projectId,
				body,
				apiKey?.id,
			);
			return c.json(result);
		},
	)
	.patch(
		"/project/:projectId",
		describeRoute({
			operationId: "updateTelegramIntegration",
			tags: ["Telegram"],
			description: "Update Telegram integration settings",
			responses: {
				200: {
					description: "Telegram integration updated successfully",
					content: {
						"application/json": { schema: resolver(telegramIntegrationSchema) },
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				botToken: v.optional(v.string()),
				chatId: v.optional(v.string()),
				threadId: v.optional(v.nullable(v.number())),
				chatLabel: v.optional(v.nullable(v.string())),
				isActive: v.optional(v.boolean()),
				events: v.optional(telegramEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			const apiKey = c.get("apiKey");
			const result = await updateTelegramIntegration(
				c.get("userId"),
				projectId,
				body,
				apiKey?.id,
			);
			return c.json(result);
		},
	)
	.delete(
		"/project/:projectId",
		describeRoute({
			operationId: "deleteTelegramIntegration",
			tags: ["Telegram"],
			description: "Delete Telegram integration for a project",
			responses: {
				200: {
					description: "Telegram integration deleted successfully",
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
			const apiKey = c.get("apiKey");
			await deleteTelegramIntegration(c.get("userId"), projectId, apiKey?.id);
			return c.json({ success: true });
		},
	);

export default telegramIntegration;
