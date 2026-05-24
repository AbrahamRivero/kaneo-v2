import { useQuery } from "@tanstack/react-query";
import { getWorkspaceFeatures } from "@/fetchers/features/get-workspace-features";

export function useWorkspaceFeatures(workspaceId: string) {
	return useQuery({
		queryKey: ["workspace-features", workspaceId],
		queryFn: () => getWorkspaceFeatures(workspaceId),
		enabled: !!workspaceId,
	});
}

export function useFeatureEnabled(
	workspaceId: string,
	featureKey: string,
): boolean {
	const { data: features } = useWorkspaceFeatures(workspaceId);
	const feature = features?.find((f) => f.key === featureKey);
	return feature?.enabled ?? false;
}
