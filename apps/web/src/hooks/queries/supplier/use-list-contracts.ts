import { useQuery } from "@tanstack/react-query";
import listContracts from "@/fetchers/supplier/list-contracts";

function useListContracts(workspaceId: string) {
	return useQuery({
		queryKey: ["contracts", workspaceId],
		queryFn: () => listContracts(workspaceId),
		enabled: !!workspaceId,
	});
}

export default useListContracts;
