import { useMutation, useQueryClient } from "@tanstack/react-query";
import setBudget from "@/fetchers/budget/set-budget";

export function useSetBudget() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: setBudget,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["budget", variables.projectId],
			});
		},
	});
}
