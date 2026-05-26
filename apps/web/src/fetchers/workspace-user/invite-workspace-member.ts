import i18n from "i18next";
import { authClient } from "@/lib/auth-client";

export type InviteWorkspaceMemberRequest = {
	workspaceId: string;
	email: string;
	role?: "owner" | "admin" | "member";
};

const inviteWorkspaceMember = async ({
	workspaceId,
	email,
	role = "member",
}: InviteWorkspaceMemberRequest) => {
	const { data, error } = await authClient.organization.inviteMember({
		organizationId: workspaceId,
		email,
		role,
	});

	if (error) {
		throw new Error(
			error.message || i18n.t("common:error.inviteWorkspaceMember"),
		);
	}

	return data;
};

export default inviteWorkspaceMember;
