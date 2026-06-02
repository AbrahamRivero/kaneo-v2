import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { genericWebhookIntegrationSchema } from "../schemas";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createGenericWebhookIntegration from "./controllers/create-generic-webhook-integration";
import deleteGenericWebhookIntegration from "./controllers/delete-generic-webhook-integration";
import getGenericWebhookIntegration from "./controllers/get-generic-webhook-integration";
import updateGenericWebhookIntegration from "./controllers/update-generic-webhook-integration";

const genericWebhookIntegration = new Hono<{
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

const genericWebhookEventsSchema = v.object({
	taskCreated: v.optional(v.boolean()),
	taskStatusChanged: v.optional(v.boolean()),
	taskPriorityChanged: v.optional(v.boolean()),
	taskTitleChanged: v.optional(v.boolean()),
	taskDescriptionChanged: v.optional(v.boolean()),
	taskCommentCreated: v.optional(v.boolean()),
});

const nullableGenericWebhookIntegrationSchema = v.nullable(
	genericWebhookIntegrationSchema,
);

genericWebhookIntegration
	.get(
		"/project/:projectId",
		describeRoute({
			operationId: "getGenericWebhookIntegration",
			tags: ["Generic Webhook"],
			description: "Get generic outgoing webhook integration for a project",
			responses: {
				200: {
					description: "Generic webhook integration details",
					content: {
						"application/json": {
							schema: resolver(nullableGenericWebhookIntegrationSchema),
						},
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		workspaceAccess.fromProject("projectId"),
		requireWorkspacePermission({ project: ["read"] }),
		async (c) => {
			const { projectId } = c.req.valid("param");
			return c.json(await getGenericWebhookIntegration(projectId));
		},
	)
	.post(
		"/project/:projectId",
		describeRoute({
			operationId: "createGenericWebhookIntegration",
			tags: ["Generic Webhook"],
			description: "Create or replace a generic outgoing webhook integration",
			responses: {
				200: {
					description: "Generic webhook integration created successfully",
					content: {
						"application/json": {
							schema: resolver(genericWebhookIntegrationSchema),
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
				secret: v.optional(v.string()),
				events: v.optional(genericWebhookEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		requireWorkspacePermission({ workspace: ["manage_settings"] }),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			return c.json(await createGenericWebhookIntegration(projectId, body));
		},
	)
	.patch(
		"/project/:projectId",
		describeRoute({
			operationId: "updateGenericWebhookIntegration",
			tags: ["Generic Webhook"],
			description: "Update generic outgoing webhook settings",
			responses: {
				200: {
					description: "Generic webhook integration updated successfully",
					content: {
						"application/json": {
							schema: resolver(genericWebhookIntegrationSchema),
						},
					},
				},
			},
		}),
		validator("param", v.object({ projectId: v.string() })),
		validator(
			"json",
			v.object({
				webhookUrl: v.optional(v.string()),
				secret: v.optional(v.nullable(v.string())),
				isActive: v.optional(v.boolean()),
				events: v.optional(genericWebhookEventsSchema),
			}),
		),
		workspaceAccess.fromProject("projectId"),
		requireWorkspacePermission({ workspace: ["manage_settings"] }),
		async (c) => {
			const { projectId } = c.req.valid("param");
			const body = c.req.valid("json");
			return c.json(await updateGenericWebhookIntegration(projectId, body));
		},
	)
	.delete(
		"/project/:projectId",
		describeRoute({
			operationId: "deleteGenericWebhookIntegration",
			tags: ["Generic Webhook"],
			description: "Delete generic outgoing webhook integration for a project",
			responses: {
				200: {
					description: "Generic webhook integration deleted successfully",
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
		requireWorkspacePermission({ workspace: ["manage_settings"] }),
		async (c) => {
			const { projectId } = c.req.valid("param");
			await deleteGenericWebhookIntegration(projectId);
			return c.json({ success: true });
		},
	);

export default genericWebhookIntegration;
