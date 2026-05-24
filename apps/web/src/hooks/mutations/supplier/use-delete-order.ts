import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import deleteOrder from "@/fetchers/supplier/delete-order";

function useDeleteOrder(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (orderId: string) => deleteOrder(orderId, workspaceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Service order deleted");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useDeleteOrder;
