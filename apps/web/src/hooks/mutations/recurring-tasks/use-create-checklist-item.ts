import { useMutation, useQueryClient } from "@tanstack/react-query";
import createChecklistItem from "@/fetchers/recurring-tasks/create-checklist-item";

export function useCreateChecklistItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createChecklistItem,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: [
					"recurring-tasks",
					variables.projectId,
					variables.recurringTaskId,
					"checklist-items",
				],
			});
		},
	});
}
