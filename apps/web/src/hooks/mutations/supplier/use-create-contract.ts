import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import createContract from "@/fetchers/supplier/create-contract";

function useCreateContract(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			supplierId,
			data,
		}: {
			supplierId: string;
			data: Parameters<typeof createContract>[1];
		}) => createContract(supplierId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contracts", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Contract created");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useCreateContract;
