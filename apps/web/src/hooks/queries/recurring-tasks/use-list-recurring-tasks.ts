import { useQuery } from "@tanstack/react-query";
import listRecurringTasks from "@/fetchers/recurring-tasks/list-recurring-tasks";

function useListRecurringTasks(projectId: string) {
	return useQuery({
		queryKey: ["recurring-tasks", projectId],
		queryFn: () => listRecurringTasks(projectId),
		enabled: !!projectId,
	});
}

export default useListRecurringTasks;
