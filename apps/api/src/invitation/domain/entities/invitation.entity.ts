export interface Invitation {
	id: string;
	workspaceId: string;
	email: string;
	role: string | null;
	teamId: string | null;
	status: "pending" | "accepted" | "canceled";
	expiresAt: Date;
	createdAt: Date;
	inviterId: string;
}

export interface InvitationWithDetails extends Invitation {
	workspaceName: string;
	inviterName: string;
}

export interface InvitationDetails {
	id: string;
	email: string;
	workspaceName: string;
	inviterName: string;
	expiresAt: Date;
	status: string;
	expired: boolean;
}

export interface InvitationDetailsResult {
	valid: boolean;
	invitation?: InvitationDetails;
	error?: string;
}
