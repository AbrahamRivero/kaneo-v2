import { GetSlackIntegrationUseCase } from "../application/use-cases";
import { slackIntegrationRepository } from "../infrastructure/repositories/drizzle-slack-integration.repository";

const getSlackIntegrationUseCase = new GetSlackIntegrationUseCase(
	slackIntegrationRepository,
);

export default async function getSlackIntegration(projectId: string) {
	return getSlackIntegrationUseCase.execute(projectId);
}
