import { and, eq } from "drizzle-orm";
import db from "../database";
import { workspaceFeatureTable } from "../database/schema";
import { getFeature, listFeatures } from "./registry";

export async function isFeatureEnabled(
	workspaceId: string,
	featureKey: string,
): Promise<boolean> {
	const feature = getFeature(featureKey);
	if (!feature) return false;

	const result = await db.query.workspaceFeatureTable.findFirst({
		where: and(
			eq(workspaceFeatureTable.workspaceId, workspaceId),
			eq(workspaceFeatureTable.featureKey, featureKey),
		),
	});

	return result?.enabled ?? feature.defaultEnabled;
}

export async function getWorkspaceFeatures(
	workspaceId: string,
): Promise<{ key: string; enabled: boolean; config: string | null }[]> {
	const registered = listFeatures();

	const stored = await db.query.workspaceFeatureTable.findMany({
		where: eq(workspaceFeatureTable.workspaceId, workspaceId),
	});

	return registered.map((f) => {
		const storedFeature = stored.find((s) => s.featureKey === f.key);
		return {
			key: f.key,
			enabled: storedFeature?.enabled ?? f.defaultEnabled,
			config: storedFeature?.config ?? null,
		};
	});
}

export async function setFeaturesEnabled(
	workspaceId: string,
	features: { key: string; enabled: boolean; config?: string }[],
): Promise<void> {
	for (const f of features) {
		await db
			.insert(workspaceFeatureTable)
			.values({
				workspaceId,
				featureKey: f.key,
				enabled: f.enabled,
				config: f.config,
			})
			.onConflictDoUpdate({
				target: [
					workspaceFeatureTable.workspaceId,
					workspaceFeatureTable.featureKey,
				],
				set: {
					enabled: f.enabled,
					config: f.config,
				},
			});
	}
}
