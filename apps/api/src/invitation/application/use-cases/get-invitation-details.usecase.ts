import type { InvitationDetails, InvitationDetailsResult } from "../../domain";
import type { InvitationRepository } from "../ports/invitation-repository.port";

export class GetInvitationDetailsUseCase {
	constructor(private invitationRepository: InvitationRepository) {}

	async execute(invitationId: string): Promise<InvitationDetailsResult> {
		const row =
			await this.invitationRepository.findWithDetailsById(invitationId);

		if (!row) {
			return {
				valid: false,
				error: "Invitation not found",
			};
		}

		const now = new Date();
		const expired = row.expiresAt < now;
		const isAccepted = row.status === "accepted";
		const isCanceled = row.status === "canceled";

		const baseInvitation: InvitationDetails = {
			id: row.id,
			email: row.email,
			workspaceName: row.workspaceName,
			inviterName: row.inviterName,
			expiresAt: row.expiresAt,
			status: row.status,
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
}
