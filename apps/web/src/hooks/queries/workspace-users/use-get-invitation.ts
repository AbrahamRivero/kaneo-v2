import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useGetInvitation(invitationId: string) {
	return useQuery({
		queryKey: ["invitation", invitationId],
		queryFn: async () => {
			const { data, error } = await authClient.organization.getInvitation({
				invitationId,
			});

			if (error) {
				throw new Error(error.message || i18n.t("common:error.getInvitation"));
			}

			return data;
		},
		enabled: !!invitationId,
	});
}

export default useGetInvitation;
