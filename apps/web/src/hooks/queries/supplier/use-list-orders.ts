import { useQuery } from "@tanstack/react-query";
import listOrders from "@/fetchers/supplier/list-orders";

function useListOrders(workspaceId: string) {
	return useQuery({
		queryKey: ["orders", workspaceId],
		queryFn: () => listOrders(workspaceId),
		enabled: !!workspaceId,
	});
}

export default useListOrders;
