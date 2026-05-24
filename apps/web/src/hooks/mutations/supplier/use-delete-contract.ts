import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import deleteContract from "@/fetchers/supplier/delete-contract";

function useDeleteContract(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (contractId: string) => deleteContract(contractId, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contracts", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Contract deleted");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useDeleteContract;
