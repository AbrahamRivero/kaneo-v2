import { publishEvent } from "../../events";
import type { EventPublisher } from "../application/ports";
import { UpdateTelegramIntegrationUseCase } from "../application/use-cases";
import type { UpdateTelegramIntegrationInput } from "../domain";
import { telegramIntegrationRepository } from "../infrastructure/repositories/drizzle-telegram-integration.repository";

const eventPublisher: EventPublisher = { publish: publishEvent };

const updateTelegramIntegrationUseCase = new UpdateTelegramIntegrationUseCase(
	telegramIntegrationRepository,
	eventPublisher,
);

export default async function updateTelegramIntegration(
	userId: string,
	projectId: string,
	body: UpdateTelegramIntegrationInput,
	apiKeyId?: string,
) {
	return updateTelegramIntegrationUseCase.execute(
		userId,
		projectId,
		apiKeyId,
		body,
	);
}
