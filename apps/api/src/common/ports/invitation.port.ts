export type InvitationStatus = "pending" | "accepted" | "canceled";

export interface Invitation {
	id: string;
	workspaceId: string;
	email: string;
	role: string | null;
	teamId: string | null;
	status: InvitationStatus;
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

export interface InvitationRepository {
	findById(id: string): Promise<Invitation | null>;
	findByEmailAndStatus(
		email: string,
		status: string,
	): Promise<InvitationWithDetails[]>;
	findWithDetailsById(id: string): Promise<InvitationWithDetails | null>;
}
