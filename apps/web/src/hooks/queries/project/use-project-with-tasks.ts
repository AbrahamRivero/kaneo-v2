import { useQuery } from "@tanstack/react-query";
import getProject from "@/fetchers/project/get-project";
import getTasks from "@/fetchers/task/get-tasks";

type UseProjectWithTasksOptions = {
	projectId: string;
	workspaceId: string;
};

export function useProjectWithTasks({
	projectId,
	workspaceId,
}: UseProjectWithTasksOptions) {
	const projectQuery = useQuery({
		queryKey: ["projects", workspaceId, projectId],
		queryFn: () => getProject({ id: projectId, workspaceId }),
		enabled: !!projectId && !!workspaceId,
	});

	const tasksQuery = useQuery({
		queryKey: ["tasks", projectId],
		queryFn: () => getTasks(projectId),
		enabled: !!projectId,
		refetchInterval: 30000,
	});

	const project = tasksQuery.data;

	return {
		project,
		projectName: project?.name,
		isLoading: projectQuery.isLoading || tasksQuery.isLoading,
		isError: projectQuery.isError || tasksQuery.isError,
		projectQuery,
		tasksQuery,
	};
}
