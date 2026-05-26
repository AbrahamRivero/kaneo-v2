import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useCancelInvitation() {
	return useMutation({
		mutationFn: async ({ invitationId }: { invitationId: string }) => {
			const { data, error } = await authClient.organization.cancelInvitation({
				invitationId,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.cancelInvitation"),
				);
			}

			return data;
		},
	});
}

export default useCancelInvitation;
