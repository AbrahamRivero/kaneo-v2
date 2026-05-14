import { DeleteWorkspaceRuleUseCase } from "../application/use-cases";
import { notificationPreferenceRepository } from "../infrastructure/repositories/drizzle-notification-preference.repository";

async function deleteWorkspaceRuleController(
	userId: string,
	workspaceId: string,
	userEmail: string | null,
) {
	const useCase = new DeleteWorkspaceRuleUseCase(
		notificationPreferenceRepository,
	);
	return useCase.execute(userId, workspaceId, userEmail);
}

export default deleteWorkspaceRuleController;
