import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import getTask from "@/fetchers/task/get-task";

function useGetTask(taskId: string | null) {
	return useQuery({
		queryKey: ["task", taskId],
		queryFn: () => {
			if (!taskId) throw new Error(i18n.t("common:error.taskIdRequired"));
			return getTask(taskId);
		},
		enabled: Boolean(taskId),
		refetchOnMount: "always",
		staleTime: 0,
	});
}

export default useGetTask;
