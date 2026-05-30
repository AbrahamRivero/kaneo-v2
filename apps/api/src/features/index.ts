import { Hono } from "hono";
import { validator } from "hono-openapi";
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

features.get("/registry", async (c) => {
	const byCategory = getFeaturesByCategory();
	return c.json(byCategory);
});

features.get(
	"/workspace/:workspaceId",
	workspaceAccess.fromParam("workspaceId"),
	async (c) => {
		const workspaceId = c.get("workspaceId") as string;
		const result = await getWorkspaceFeatures(workspaceId);
		return c.json(result);
	},
);

features.put(
	"/workspace/:workspaceId",
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
