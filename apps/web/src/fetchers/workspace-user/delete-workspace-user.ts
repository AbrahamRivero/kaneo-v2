import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

export type DeleteWorkspaceUserRequest = {
	workspaceId: string;
	userId: string;
};

async function deleteWorkspaceUser({
	workspaceId,
	userId,
}: DeleteWorkspaceUserRequest) {
	const { data, error } = await authClient.organization.removeMember({
		organizationId: workspaceId,
		memberIdOrEmail: userId,
	});

	if (error) {
		throw new Error(
			error.message || i18n.t("common:error.removeWorkspaceMember"),
		);
	}

	return data;
}

export default deleteWorkspaceUser;
