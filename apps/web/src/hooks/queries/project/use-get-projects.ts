import { useQuery } from "@tanstack/react-query";
import getProjects from "@/fetchers/project/get-projects";

function useGetProjects({
	workspaceId,
	includeArchived,
}: {
	workspaceId: string;
	includeArchived?: boolean;
}) {
	return useQuery({
		queryFn: () => getProjects({ workspaceId, includeArchived }),
		queryKey: ["projects", workspaceId, { includeArchived }],
		enabled: !!workspaceId,
	});
}

export default useGetProjects;
