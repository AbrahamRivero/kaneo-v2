import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateExpense from "@/fetchers/budget/update-expense";

export function useUpdateExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateExpense,
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
