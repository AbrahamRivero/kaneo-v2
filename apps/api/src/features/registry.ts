import type { FeatureModule } from "./types";

const features = new Map<string, FeatureModule>();

export function registerFeature(feature: FeatureModule): void {
	if (features.has(feature.key)) {
		throw new Error(`Feature ${feature.key} already registered`);
	}
	features.set(feature.key, feature);
}

export function getFeature(key: string): FeatureModule | undefined {
	return features.get(key);
}

export function listFeatures(): FeatureModule[] {
	return Array.from(features.values());
}

export function getFeaturesByCategory(): Record<string, FeatureModule[]> {
	const byCategory: Record<string, FeatureModule[]> = {};

	for (const feature of features.values()) {
		const category = feature.category;
		if (!byCategory[category]) {
			byCategory[category] = [];
		}
		byCategory[category].push(feature);
	}

	return byCategory;
}
