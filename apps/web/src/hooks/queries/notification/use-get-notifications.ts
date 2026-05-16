import { useQuery } from "@tanstack/react-query";
import getNotifications from "@/fetchers/notification/get-notifications";

function useGetNotifications() {
	return useQuery({
		queryKey: ["notifications"],
		queryFn: getNotifications,
		refetchInterval: 10_000,
	});
}

export default useGetNotifications;
