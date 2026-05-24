import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import updateContract from "@/fetchers/supplier/update-contract";

function useUpdateContract(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			contractId,
			data,
		}: {
			contractId: string;
			data: Parameters<typeof updateContract>[2];
		}) => updateContract(contractId, workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contracts", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Contract updated");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useUpdateContract;
