import { publishEvent } from "../../events";
import type { EventPublisher } from "../application/ports";
import { DeleteTelegramIntegrationUseCase } from "../application/use-cases";
import { telegramIntegrationRepository } from "../infrastructure/repositories/drizzle-telegram-integration.repository";

const eventPublisher: EventPublisher = { publish: publishEvent };

const deleteTelegramIntegrationUseCase = new DeleteTelegramIntegrationUseCase(
	telegramIntegrationRepository,
	eventPublisher,
);

export default async function deleteTelegramIntegration(
	userId: string,
	projectId: string,
	apiKeyId?: string,
) {
	await deleteTelegramIntegrationUseCase.execute(userId, projectId, apiKeyId);
}
