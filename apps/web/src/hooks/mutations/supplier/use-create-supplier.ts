import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import createSupplier from "@/fetchers/supplier/create-supplier";

function useCreateSupplier(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof createSupplier>[1]) =>
			createSupplier(workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			toast.success("Supplier created");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useCreateSupplier;
