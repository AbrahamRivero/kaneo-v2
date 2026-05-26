import { useMutation } from "@tanstack/react-query";
import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

type UpdateWorkspaceUserRoleRequest = {
	workspaceId: string;
	memberId: string;
	role: "admin" | "member" | "owner";
};

function useUpdateWorkspaceUserRole() {
	return useMutation({
		mutationFn: async ({
			workspaceId,
			memberId,
			role,
		}: UpdateWorkspaceUserRoleRequest) => {
			const { data, error } = await authClient.organization.updateMemberRole({
				memberId,
				organizationId: workspaceId,
				role,
			});

			if (error) {
				throw new Error(
					error.message || i18n.t("common:error.updateWorkspaceMemberRole"),
				);
			}

			return data;
		},
	});
}

export default useUpdateWorkspaceUserRole;
