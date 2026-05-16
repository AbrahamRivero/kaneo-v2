import { CreateGenericWebhookIntegrationUseCase } from "../application/use-cases";
import type { CreateGenericWebhookIntegrationInput } from "../domain";
import { genericWebhookIntegrationRepository } from "../infrastructure/repositories/drizzle-generic-webhook-integration.repository";

const createGenericWebhookIntegrationUseCase =
	new CreateGenericWebhookIntegrationUseCase(
		genericWebhookIntegrationRepository,
	);

export default async function createGenericWebhookIntegration(
	projectId: string,
	body: {
		webhookUrl: string;
		secret?: string;
		events?: CreateGenericWebhookIntegrationInput["events"];
	},
) {
	const input: CreateGenericWebhookIntegrationInput = {
		projectId,
		webhookUrl: body.webhookUrl,
		secret: body.secret,
		events: body.events,
	};

	return createGenericWebhookIntegrationUseCase.execute(input);
}
