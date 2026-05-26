import { useMutation, useQueryClient } from "@tanstack/react-query";
import createRecurringTask from "@/fetchers/recurring-tasks/create-recurring-task";

export function useCreateRecurringTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createRecurringTask,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["recurring-tasks", variables.projectId],
			});
		},
	});
}
