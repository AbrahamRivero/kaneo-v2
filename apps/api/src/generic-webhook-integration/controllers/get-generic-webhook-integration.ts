import { GetGenericWebhookIntegrationUseCase } from "../application/use-cases";
import { genericWebhookIntegrationRepository } from "../infrastructure/repositories/drizzle-generic-webhook-integration.repository";

const getGenericWebhookIntegrationUseCase =
	new GetGenericWebhookIntegrationUseCase(genericWebhookIntegrationRepository);

export default async function getGenericWebhookIntegration(projectId: string) {
	return getGenericWebhookIntegrationUseCase.execute(projectId);
}
