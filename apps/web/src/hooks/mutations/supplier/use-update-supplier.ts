import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import updateSupplier from "@/fetchers/supplier/update-supplier";

function useUpdateSupplier(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			supplierId,
			data,
		}: {
			supplierId: string;
			data: Parameters<typeof updateSupplier>[1];
		}) => updateSupplier(supplierId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Supplier updated");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useUpdateSupplier;
