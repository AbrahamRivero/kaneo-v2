import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteExpense from "@/fetchers/budget/delete-expense";

export function useDeleteExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteExpense,
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
