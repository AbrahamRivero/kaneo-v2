import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteTemplate from "@/fetchers/template/delete-template";

export function useDeleteTemplate(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (templateId: string) => deleteTemplate(templateId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["templates", workspaceId] });
		},
	});
}
