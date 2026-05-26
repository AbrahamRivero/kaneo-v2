import { client } from "@kaneo/libs";
import i18n from "i18next";

export type PendingInvitation = {
	id: string;
	email: string;
	workspaceId: string;
	workspaceName: string;
	inviterName: string;
	expiresAt: string;
	createdAt: string;
	status: string;
};

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
	const response = await client.invitation.pending.$get();

	if (!response.ok) {
		throw new Error(i18n.t("common:error.fetchPendingInvitations"));
	}

	return response.json();
}
