import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type GetWorkspaceInvitesRequest = {
	workspaceId?: string;
};

function useGetWorkspaceInvites({ workspaceId }: GetWorkspaceInvitesRequest) {
	return useQuery({
		queryKey: ["workspace-invites", workspaceId],
		queryFn: async () => {
			const { data, error } = await authClient.organization.listInvitations({
				query: {
					organizationId: workspaceId,
				},
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.getWorkspaceInvites"),
				);
			}

			return data;
		},
	});
}

export default useGetWorkspaceInvites;
