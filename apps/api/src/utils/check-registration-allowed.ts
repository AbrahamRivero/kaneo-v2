import { invitationRepository } from "../invitation/infrastructure/repositories/drizzle-invitation.repository";

type RegistrationCheckResult = {
	allowed: boolean;
	reason: string;
	invitation?: {
		id: string;
		email: string;
		workspaceId: string;
		workspaceName: string;
		inviterName: string;
		expiresAt: Date;
		status: string;
	};
};

export async function checkRegistrationAllowed(
	email?: string,
	invitationId?: string,
): Promise<RegistrationCheckResult> {
	const isRegistrationDisabled = process.env.DISABLE_REGISTRATION === "true";

	if (!isRegistrationDisabled) {
		return {
			allowed: true,
			reason: "Registration is enabled",
		};
	}

	if (!invitationId && !email) {
		return {
			allowed: false,
			reason:
				"Registration is currently disabled. Please contact your administrator for an invitation.",
		};
	}

	const invitation = await findValidInvitation(email, invitationId);

	if (!invitation) {
		return {
			allowed: false,
			reason:
				"Registration is currently disabled. You need a valid invitation to create an account.",
		};
	}

	return {
		allowed: true,
		reason: "Valid invitation found",
		invitation,
	};
}

async function findValidInvitation(
	email?: string,
	invitationId?: string,
): Promise<RegistrationCheckResult["invitation"] | null> {
	if (!invitationId && !email) {
		return null;
	}

	if (invitationId) {
		const invitation =
			await invitationRepository.findWithDetailsById(invitationId);

		if (!invitation) {
			return null;
		}

		const now = new Date();
		if (invitation.status !== "pending" || invitation.expiresAt <= now) {
			return null;
		}

		return {
			id: invitation.id,
			email: invitation.email,
			workspaceId: invitation.workspaceId,
			workspaceName: invitation.workspaceName,
			inviterName: invitation.inviterName,
			expiresAt: invitation.expiresAt,
			status: invitation.status,
		};
	}

	if (email) {
		const invitations = await invitationRepository.findByEmailAndStatus(
			email.toLowerCase(),
			"pending",
		);

		if (invitations.length === 0) {
			return null;
		}

		const invitation = invitations[0];
		return {
			id: invitation.id,
			email: invitation.email,
			workspaceId: invitation.workspaceId,
			workspaceName: invitation.workspaceName,
			inviterName: invitation.inviterName,
			expiresAt: invitation.expiresAt,
			status: invitation.status,
		};
	}

	return null;
}

export async function getInvitationDetails(invitationId: string) {
	const invitation =
		await invitationRepository.findWithDetailsById(invitationId);

	if (!invitation) {
		return {
			valid: false,
			error: "Invitation not found",
		};
	}

	const now = new Date();
	const expired = invitation.expiresAt < now;
	const isAccepted = invitation.status === "accepted";
	const isCanceled = invitation.status === "canceled";

	const baseInvitation = {
		id: invitation.id,
		email: invitation.email,
		workspaceName: invitation.workspaceName,
		inviterName: invitation.inviterName,
		expiresAt: invitation.expiresAt,
		status: invitation.status,
		expired,
	};

	if (isAccepted) {
		return {
			valid: false,
			error: "This invitation has already been accepted",
		};
	}

	if (isCanceled) {
		return {
			valid: false,
			error: "This invitation has been canceled",
		};
	}

	if (expired) {
		return {
			valid: false,
			invitation: baseInvitation,
			error: "This invitation has expired",
		};
	}

	return {
		valid: true,
		invitation: baseInvitation,
	};
}

export async function getUserPendingInvitations(userEmail: string) {
	return invitationRepository.findByEmailAndStatus(
		userEmail.toLowerCase(),
		"pending",
	);
}
