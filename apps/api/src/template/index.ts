import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import db from "../database";
import { templateTable } from "../database/schema";
import { isFeatureEnabled } from "../features/db";
import { requireFeature } from "../features/middleware";
import {
	checkWorkspacePermission,
	requireWorkspacePermission,
} from "../utils/require-workspace-permission";
import { validateWorkspaceAccess } from "../utils/validate-workspace-access";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createTemplateCtrl from "./controllers/create-template";
import deleteTemplateCtrl from "./controllers/delete-template";
import getTemplateCtrl from "./controllers/get-template";
import listTemplatesCtrl from "./controllers/list-templates";
import updateTemplateCtrl from "./controllers/update-template";

const columnSchema = v.object({
	name: v.string(),
	slug: v.string(),
	position: v.number(),
	color: v.optional(v.string()),
	isFinal: v.optional(v.boolean()),
});

const taskSchema = v.object({
	title: v.string(),
	description: v.optional(v.string()),
	columnSlug: v.string(),
	priority: v.optional(v.string()),
});

const template = new Hono<{
	Variables: {
		userId: string;
		workspaceId: string;
	};
}>()
	.get(
		"/workspace/:workspaceId",
		describeRoute({
			operationId: "listTemplates",
			tags: ["Templates"],
			description: "List all available templates for a workspace",
			responses: {
				200: {
					description: "List of templates",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		workspaceAccess.fromParam("workspaceId"),
		requireFeature("templates"),
		requireWorkspacePermission({ project: ["read"] }),
		async (c) => {
			const workspaceId = c.get("workspaceId");
			const result = await listTemplatesCtrl(workspaceId);
			return c.json(result);
		},
	)
	.get(
		"/:id",
		describeRoute({
			operationId: "getTemplate",
			tags: ["Templates"],
			description: "Get a template by ID with its columns and tasks",
			responses: {
				200: {
					description: "Template details",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator("param", v.object({ id: v.string() })),
		async (c) => {
			const { id } = c.req.valid("param");
			const userId = c.get("userId") as string;
			const [tmpl] = await db
				.select({ workspaceId: templateTable.workspaceId })
				.from(templateTable)
				.where(eq(templateTable.id, id))
				.limit(1);
			if (!tmpl)
				throw new HTTPException(404, { message: "Template not found" });
			const workspaceId = tmpl.workspaceId as string;
			await validateWorkspaceAccess(userId, workspaceId);
			if (!(await isFeatureEnabled(workspaceId, "templates"))) {
				throw new HTTPException(404, { message: "Feature not available" });
			}
			await checkWorkspacePermission(workspaceId, userId, {
				project: ["read"],
			});
			const result = await getTemplateCtrl(id);
			return c.json(result);
		},
	)
	.post(
		"/",
		describeRoute({
			operationId: "createTemplate",
			tags: ["Templates"],
			description: "Create a new project template",
			responses: {
				200: {
					description: "Template created successfully",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator(
			"json",
			v.object({
				workspaceId: v.string(),
				name: v.string(),
				description: v.optional(v.string()),
				icon: v.optional(v.string()),
				columns: v.array(columnSchema),
				tasks: v.optional(v.array(taskSchema)),
			}),
		),
		workspaceAccess.fromBody(),
		requireFeature("templates"),
		requireWorkspacePermission({ project: ["create"] }),
		async (c) => {
			const data = c.req.valid("json");
			const workspaceId = c.get("workspaceId");
			const result = await createTemplateCtrl({
				...data,
				workspaceId,
			});
			return c.json(result);
		},
	)
	.put(
		"/:id",
		describeRoute({
			operationId: "updateTemplate",
			tags: ["Templates"],
			description: "Update a project template",
			responses: {
				200: {
					description: "Template updated successfully",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator("param", v.object({ id: v.string() })),
		validator(
			"json",
			v.object({
				name: v.optional(v.string()),
				description: v.optional(v.nullable(v.string())),
				icon: v.optional(v.string()),
				columns: v.optional(v.array(columnSchema)),
				tasks: v.optional(v.array(taskSchema)),
			}),
		),
		async (c) => {
			const { id } = c.req.valid("param");
			const userId = c.get("userId") as string;
			const [tmpl] = await db
				.select({ workspaceId: templateTable.workspaceId })
				.from(templateTable)
				.where(eq(templateTable.id, id))
				.limit(1);
			if (!tmpl)
				throw new HTTPException(404, { message: "Template not found" });
			const workspaceId = tmpl.workspaceId as string;
			await validateWorkspaceAccess(userId, workspaceId);
			if (!(await isFeatureEnabled(workspaceId, "templates"))) {
				throw new HTTPException(404, { message: "Feature not available" });
			}
			await checkWorkspacePermission(workspaceId, userId, {
				project: ["update"],
			});
			const data = c.req.valid("json");
			const result = await updateTemplateCtrl(id, data);
			return c.json(result);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			operationId: "deleteTemplate",
			tags: ["Templates"],
			description: "Delete a project template",
			responses: {
				200: {
					description: "Template deleted successfully",
					content: {
						"application/json": { schema: resolver(v.any()) },
					},
				},
			},
		}),
		validator("param", v.object({ id: v.string() })),
		async (c) => {
			const { id } = c.req.valid("param");
			const userId = c.get("userId") as string;
			const [tmpl] = await db
				.select({ workspaceId: templateTable.workspaceId })
				.from(templateTable)
				.where(eq(templateTable.id, id))
				.limit(1);
			if (!tmpl)
				throw new HTTPException(404, { message: "Template not found" });
			const workspaceId = tmpl.workspaceId as string;
			await validateWorkspaceAccess(userId, workspaceId);
			if (!(await isFeatureEnabled(workspaceId, "templates"))) {
				throw new HTTPException(404, { message: "Feature not available" });
			}
			await checkWorkspacePermission(workspaceId, userId, {
				project: ["delete"],
			});
			const result = await deleteTemplateCtrl(id);
			return c.json(result);
		},
	);

export default template;
