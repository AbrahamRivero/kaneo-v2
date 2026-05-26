import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

function useRejectInvitation() {
	return useMutation({
		mutationFn: async ({ invitationId }: { invitationId: string }) => {
			const { data, error } = await authClient.organization.rejectInvitation({
				invitationId,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.rejectInvitation"),
				);
			}

			return data;
		},
	});
}

export default useRejectInvitation;
