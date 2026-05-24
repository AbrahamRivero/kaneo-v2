import { useQuery } from "@tanstack/react-query";
import getBudget from "@/fetchers/budget/get-budget";

function useGetBudget(projectId: string) {
	return useQuery({
		queryKey: ["budget", projectId],
		queryFn: () => getBudget(projectId),
		enabled: !!projectId,
	});
}

export default useGetBudget;
