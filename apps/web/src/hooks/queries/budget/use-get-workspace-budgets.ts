import { useQuery } from "@tanstack/react-query";
import getWorkspaceBudgets from "@/fetchers/budget/get-workspace-budgets";

function useGetWorkspaceBudgets(workspaceId: string) {
	return useQuery({
		queryKey: ["workspace-budgets", workspaceId],
		queryFn: () => getWorkspaceBudgets(workspaceId),
		enabled: !!workspaceId,
	});
}

export default useGetWorkspaceBudgets;
