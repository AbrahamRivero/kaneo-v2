import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteChecklistItem from "@/fetchers/recurring-tasks/delete-checklist-item";

export function useDeleteChecklistItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			projectId: string;
			recurringTaskId: string;
			checklistItemId: string;
		}) =>
			deleteChecklistItem(
				data.projectId,
				data.recurringTaskId,
				data.checklistItemId,
			),
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
