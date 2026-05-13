import { createInvitationUseCases } from "../application";

const { getUserPendingInvitations } = createInvitationUseCases();

async function getUserPendingInvitationsController(userEmail: string) {
	if (!userEmail) {
		console.error(
			"getUserPendingInvitationsController: userEmail is empty or undefined",
		);
		throw new Error("userEmail is required");
	}
	return getUserPendingInvitations.execute({ userEmail });
}

export default getUserPendingInvitationsController;
