import { UpsertWorkspaceRuleUseCase } from "../application/use-cases";
import type { UpsertWorkspaceRuleInput } from "../domain";
import { notificationPreferenceRepository } from "../infrastructure/repositories/drizzle-notification-preference.repository";

async function upsertWorkspaceRuleController(
	userId: string,
	workspaceId: string,
	userEmail: string | null,
	input: UpsertWorkspaceRuleInput,
) {
	const useCase = new UpsertWorkspaceRuleUseCase(
		notificationPreferenceRepository,
	);
	return useCase.execute(userId, workspaceId, userEmail, input);
}

export default upsertWorkspaceRuleController;
