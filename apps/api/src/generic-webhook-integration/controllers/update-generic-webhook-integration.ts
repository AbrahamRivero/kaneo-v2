import { UpdateGenericWebhookIntegrationUseCase } from "../application/use-cases";
import type { UpdateGenericWebhookIntegrationInput } from "../domain";
import { genericWebhookIntegrationRepository } from "../infrastructure/repositories/drizzle-generic-webhook-integration.repository";

const updateGenericWebhookIntegrationUseCase =
	new UpdateGenericWebhookIntegrationUseCase(
		genericWebhookIntegrationRepository,
	);

export default async function updateGenericWebhookIntegration(
	projectId: string,
	body: UpdateGenericWebhookIntegrationInput,
) {
	return updateGenericWebhookIntegrationUseCase.execute(projectId, body);
}
