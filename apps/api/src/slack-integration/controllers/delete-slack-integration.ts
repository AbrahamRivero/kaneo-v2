import { DeleteSlackIntegrationUseCase } from "../application/use-cases";
import { slackIntegrationRepository } from "../infrastructure/repositories/drizzle-slack-integration.repository";

const deleteSlackIntegrationUseCase = new DeleteSlackIntegrationUseCase(
	slackIntegrationRepository,
);

export default async function deleteSlackIntegration(projectId: string) {
	await deleteSlackIntegrationUseCase.execute(projectId);
}
