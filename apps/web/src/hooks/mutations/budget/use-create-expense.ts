import { useMutation, useQueryClient } from "@tanstack/react-query";
import createExpense from "@/fetchers/budget/create-expense";

export function useCreateExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createExpense,
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
