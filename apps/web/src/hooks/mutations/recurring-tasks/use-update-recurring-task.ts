import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateRecurringTask from "@/fetchers/recurring-tasks/update-recurring-task";

export function useUpdateRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateRecurringTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
