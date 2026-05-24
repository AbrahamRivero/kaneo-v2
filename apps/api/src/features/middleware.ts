import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { isFeatureEnabled } from "./db";

export function requireFeature(featureKey: string) {
	return async (c: Context, next: () => Promise<void>) => {
		const workspaceId = c.get("workspaceId") as string | undefined;
		if (!workspaceId) {
			throw new HTTPException(400, { message: "No workspace context" });
		}

		const enabled = await isFeatureEnabled(workspaceId, featureKey);
		if (!enabled) {
			throw new HTTPException(404, { message: "Feature not available" });
		}

		await next();
	};
}
