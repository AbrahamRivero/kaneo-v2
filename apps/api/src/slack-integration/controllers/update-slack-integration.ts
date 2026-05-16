import { UpdateSlackIntegrationUseCase } from "../application/use-cases";
import type { UpdateSlackIntegrationInput } from "../domain";
import { slackIntegrationRepository } from "../infrastructure/repositories/drizzle-slack-integration.repository";

const updateSlackIntegrationUseCase = new UpdateSlackIntegrationUseCase(
	slackIntegrationRepository,
);

export default async function updateSlackIntegration(
	projectId: string,
	body: UpdateSlackIntegrationInput,
) {
	return updateSlackIntegrationUseCase.execute(projectId, body);
}
