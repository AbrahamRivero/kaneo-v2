import { getApiUrl } from "@/fetchers/get-api-url";

export type WorkspaceFeatureStatus = {
	key: string;
	enabled: boolean;
	config: string | null;
};

export type FeatureModule = {
	key: string;
	name: string;
	description: string;
	category: string;
	defaultEnabled: boolean;
	dependencies?: string[];
	workspaceNav?: { title: string; icon: string; to: string };
	projectNav?: { title: string; icon: string; to: string };
};

export async function getWorkspaceFeatures(
	workspaceId: string,
): Promise<WorkspaceFeatureStatus[]> {
	const response = await fetch(
		getApiUrl(`/features/workspace/${workspaceId}`),
		{
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch workspace features");
	}

	return response.json();
}

export async function getFeatureRegistry(): Promise<
	Record<string, FeatureModule[]>
> {
	const response = await fetch(getApiUrl("/features/registry"), {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch feature registry");
	}

	return response.json();
}

export async function updateWorkspaceFeatures(
	workspaceId: string,
	features: { key: string; enabled: boolean; config?: string }[],
): Promise<void> {
	const response = await fetch(
		getApiUrl(`/features/workspace/${workspaceId}`),
		{
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ features }),
		},
	);

	if (!response.ok) {
		throw new Error("Failed to update workspace features");
	}
}
