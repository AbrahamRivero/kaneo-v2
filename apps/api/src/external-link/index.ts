import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import getExternalLinks from "./controllers/get-external-links";

const externalLinkSchema = v.object({
	id: v.string(),
	taskId: v.string(),
	integrationId: v.string(),
	resourceType: v.string(),
	externalId: v.string(),
	url: v.string(),
	title: v.nullable(v.string()),
	metadata: v.any(),
	createdAt: v.date(),
	updatedAt: v.date(),
});

const externalLink = new Hono<{
	Variables: {
		userId: string;
		workspaceId: string;
	};
}>().get(
	"/task/:taskId",
	describeRoute({
		operationId: "getExternalLinksByTask",
		tags: ["External Links"],
		description: "Get all external links for a task",
		responses: {
			200: {
				description: "External links for the task",
				content: {
					"application/json": {
						schema: resolver(v.array(externalLinkSchema)),
					},
				},
			},
		},
	}),
	validator("param", v.object({ taskId: v.string() })),
	workspaceAccess.fromTaskId("taskId"),
	async (c) => {
		const { taskId } = c.req.valid("param");
		const links = await getExternalLinks(taskId);
		return c.json(links);
	},
);

export default externalLink;
