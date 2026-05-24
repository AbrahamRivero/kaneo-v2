import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteRecurringTask from "@/fetchers/recurring-tasks/delete-recurring-task";

export function useDeleteRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			recurringTaskId,
			projectId,
		}: {
			recurringTaskId: string;
			projectId: string;
		}) => deleteRecurringTask(recurringTaskId, projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ refetchType: "all" });
		},
	});
}
