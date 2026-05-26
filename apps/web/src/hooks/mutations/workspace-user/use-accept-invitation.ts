import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useAcceptInvitation() {
	return useMutation({
		mutationFn: async ({ invitationId }: { invitationId: string }) => {
			const { data, error } = await authClient.organization.acceptInvitation({
				invitationId,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.acceptInvitation"),
				);
			}

			return data;
		},
	});
}

export default useAcceptInvitation;
