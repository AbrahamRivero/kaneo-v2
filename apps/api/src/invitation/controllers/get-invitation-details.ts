import { createInvitationUseCases } from "../application";

const { getInvitationDetails } = createInvitationUseCases();

async function getInvitationDetailsController(invitationId: string) {
	return getInvitationDetails.execute(invitationId);
}

export default getInvitationDetailsController;
