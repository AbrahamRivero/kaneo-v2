import { useMutation, useQueryClient } from "@tanstack/react-query";
import createRecurringTask from "@/fetchers/recurring-tasks/create-recurring-task";

export function useCreateRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createRecurringTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
