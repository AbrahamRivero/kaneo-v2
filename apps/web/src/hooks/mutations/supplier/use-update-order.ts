import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import updateOrder from "@/fetchers/supplier/update-order";

function useUpdateOrder(workspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			orderId,
			data,
		}: {
			orderId: string;
			data: Parameters<typeof updateOrder>[2];
		}) => updateOrder(orderId, workspaceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["suppliers", workspaceId] });
			queryClient.invalidateQueries({ queryKey: ["supplier"] });
			toast.success("Service order updated");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}

export default useUpdateOrder;
