import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import { getWorkspaceFeatures, setFeaturesEnabled } from "./db";
import { getFeaturesByCategory } from "./registry";

const features = new Hono<{
	Variables: {
		workspaceId: string;
	};
}>();

features.get(
	"/registry",
	describeRoute({
		operationId: "getFeatureRegistry",
		tags: ["Features"],
		description: "Get all available feature flags grouped by category",
		responses: {
			200: {
				description: "Feature registry grouped by category",
				content: {
					"application/json": { schema: resolver(v.any()) },
				},
			},
		},
	}),
	async (c) => {
		const byCategory = getFeaturesByCategory();
		return c.json(byCategory);
	},
);

features.get(
	"/workspace/:workspaceId",
	describeRoute({
		operationId: "getWorkspaceFeatures",
		tags: ["Features"],
		description: "Get feature flag states for a workspace",
		responses: {
			200: {
				description: "Workspace feature flags",
				content: {
					"application/json": { schema: resolver(v.any()) },
				},
			},
		},
	}),
	workspaceAccess.fromParam("workspaceId"),
	async (c) => {
		const workspaceId = c.get("workspaceId") as string;
		const result = await getWorkspaceFeatures(workspaceId);
		return c.json(result);
	},
);

features.put(
	"/workspace/:workspaceId",
	describeRoute({
		operationId: "updateWorkspaceFeatures",
		tags: ["Features"],
		description: "Enable or disable feature flags for a workspace",
		responses: {
			200: {
				description: "Features updated successfully",
				content: {
					"application/json": { schema: resolver(v.any()) },
				},
			},
		},
	}),
	workspaceAccess.fromParam("workspaceId"),
	requireWorkspacePermission({ feature: ["update"] }),
	validator(
		"json",
		v.object({
			features: v.array(
				v.object({
					key: v.string(),
					enabled: v.boolean(),
					config: v.optional(v.string()),
				}),
			),
		}),
	),
	async (c) => {
		const workspaceId = c.get("workspaceId") as string;
		const { features: featureUpdates } = c.req.valid("json");
		await setFeaturesEnabled(workspaceId, featureUpdates);
		return c.json({ success: true });
	},
);

export default features;
