import { useQuery } from "@tanstack/react-query";
import listTemplates from "@/fetchers/template/list-templates";

export function useListTemplates(workspaceId: string) {
	return useQuery({
		queryKey: ["templates", workspaceId],
		queryFn: () => listTemplates(workspaceId),
		enabled: !!workspaceId,
	});
}
