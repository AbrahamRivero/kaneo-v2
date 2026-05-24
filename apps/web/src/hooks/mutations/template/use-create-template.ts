import { useMutation, useQueryClient } from "@tanstack/react-query";
import createTemplate, {
	type CreateTemplateRequest,
} from "@/fetchers/template/create-template";

export function useCreateTemplate(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTemplateRequest) => createTemplate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["templates", workspaceId] });
		},
	});
}
