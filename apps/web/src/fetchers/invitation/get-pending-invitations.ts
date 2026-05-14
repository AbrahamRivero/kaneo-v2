import { client } from "@kaneo/libs";

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
		throw new Error("Failed to get pending invitations");
	}

	return response.json();
}
