import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import createOrder from "@/fetchers/supplier/create-order";

function useCreateOrder(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			supplierId,
			data,
		}: {
			supplierId: string;
			data: Parameters<typeof createOrder>[1];
		}) => createOrder(supplierId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Service order created");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useCreateOrder;
