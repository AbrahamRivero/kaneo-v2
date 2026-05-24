import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import deleteSupplier from "@/fetchers/supplier/delete-supplier";

function useDeleteSupplier(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (supplierId: string) => deleteSupplier(supplierId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			toast.success("Supplier deleted");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useDeleteSupplier;
