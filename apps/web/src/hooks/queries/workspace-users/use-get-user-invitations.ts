import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useGetUserInvitations() {
	return useQuery({
		queryKey: ["user-invitations"],
		queryFn: async () => {
			const { data, error } =
				await authClient.organization.listUserInvitations();

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.getUserInvitations"),
				);
			}

			return data;
		},
	});
}

export default useGetUserInvitations;
