import { useQuery } from "@tanstack/react-query";
import listChecklistItems from "@/fetchers/recurring-tasks/list-checklist-items";

export function useListChecklistItems(
	projectId: string,
	recurringTaskId: string,
) {
	return useQuery({
		queryKey: [
			"recurring-tasks",
			projectId,
			recurringTaskId,
			"checklist-items",
		],
		queryFn: () => listChecklistItems(projectId, recurringTaskId),
		enabled: !!recurringTaskId,
	});
}
