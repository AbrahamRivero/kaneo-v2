import type { InvitationWithDetails } from "../../domain";
import type { GetUserPendingInvitationsInput } from "../../domain/types/invitation.types";
import type { InvitationRepository } from "../ports/invitation-repository.port";

export class GetUserPendingInvitationsUseCase {
	constructor(private invitationRepository: InvitationRepository) {}

	async execute(
		input: GetUserPendingInvitationsInput,
	): Promise<InvitationWithDetails[]> {
		return this.invitationRepository.findByEmailAndStatus(
			input.userEmail.toLowerCase(),
			"pending",
		);
	}
}
