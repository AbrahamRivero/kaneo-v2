import { useQuery } from "@tanstack/react-query";
import getSupplier from "@/fetchers/supplier/get-supplier";

function useGetSupplier(supplierId: string) {
	return useQuery({
		queryKey: ["supplier", supplierId],
		queryFn: () => getSupplier(supplierId),
		enabled: !!supplierId,
	});
}

export default useGetSupplier;
