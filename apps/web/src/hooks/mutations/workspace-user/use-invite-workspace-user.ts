import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";
import queryClient from "@/query-client";

type InviteWorkspaceUserRequest = {
	workspaceId: string;
	email: string;
	role: "admin" | "member" | "owner";
	resend?: boolean;
};

function useInviteWorkspaceUser() {
	return useMutation({
		mutationFn: async ({
			workspaceId,
			email,
			role,
			resend,
		}: InviteWorkspaceUserRequest) => {
			const { data, error } = await authClient.organization.inviteMember({
				email,
				role,
				organizationId: workspaceId,
				resend,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.inviteWorkspaceMember"),
				);
			}

			return data;
		},
		onSuccess: (_, { workspaceId }) => {
			queryClient.invalidateQueries({
				queryKey: ["workspace-invites", workspaceId],
			});

			queryClient.invalidateQueries({
				queryKey: ["workspace", "full", workspaceId],
			});

			queryClient.invalidateQueries({
				queryKey: ["workspace-users", workspaceId],
			});
		},
	});
}

export default useInviteWorkspaceUser;
