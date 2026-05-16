import { DeleteGenericWebhookIntegrationUseCase } from "../application/use-cases";
import { genericWebhookIntegrationRepository } from "../infrastructure/repositories/drizzle-generic-webhook-integration.repository";

const deleteGenericWebhookIntegrationUseCase =
	new DeleteGenericWebhookIntegrationUseCase(
		genericWebhookIntegrationRepository,
	);

export default async function deleteGenericWebhookIntegration(
	projectId: string,
) {
	await deleteGenericWebhookIntegrationUseCase.execute(projectId);
}
