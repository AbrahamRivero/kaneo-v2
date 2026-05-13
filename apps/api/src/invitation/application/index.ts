export * from "./ports";
export * from "./use-cases";

import { invitationRepository } from "../infrastructure/repositories/drizzle-invitation.repository";
import {
	GetInvitationDetailsUseCase,
	GetUserPendingInvitationsUseCase,
} from "./use-cases";

export const createInvitationUseCases = () => ({
	getInvitationDetails: new GetInvitationDetailsUseCase(invitationRepository),
	getUserPendingInvitations: new GetUserPendingInvitationsUseCase(
		invitationRepository,
	),
});
