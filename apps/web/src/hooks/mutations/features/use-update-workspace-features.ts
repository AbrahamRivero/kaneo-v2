import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWorkspaceFeatures } from "@/fetchers/features/get-workspace-features";

export function useUpdateWorkspaceFeatures(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (
			features: { key: string; enabled: boolean; config?: string }[],
		) => updateWorkspaceFeatures(workspaceId, features),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["workspace-features", workspaceId],
			});
		},
	});
}
