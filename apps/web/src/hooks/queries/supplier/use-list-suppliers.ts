import { useQuery } from "@tanstack/react-query";
import listSuppliers from "@/fetchers/supplier/list-suppliers";

function useListSuppliers(workspaceId: string) {
	return useQuery({
		queryKey: ["suppliers", workspaceId],
		queryFn: () => listSuppliers(workspaceId),
		enabled: !!workspaceId,
	});
}

export default useListSuppliers;
