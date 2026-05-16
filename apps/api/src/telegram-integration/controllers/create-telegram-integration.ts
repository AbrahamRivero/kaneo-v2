import { publishEvent } from "../../events";
import type { EventPublisher } from "../application/ports";
import { CreateTelegramIntegrationUseCase } from "../application/use-cases";
import type { CreateTelegramIntegrationInput } from "../domain";
import { telegramIntegrationRepository } from "../infrastructure/repositories/drizzle-telegram-integration.repository";

const eventPublisher: EventPublisher = { publish: publishEvent };

const createTelegramIntegrationUseCase = new CreateTelegramIntegrationUseCase(
	telegramIntegrationRepository,
	eventPublisher,
);

export default async function createTelegramIntegration(
	userId: string,
	projectId: string,
	body: {
		botToken: string;
		chatId: string;
		threadId?: number;
		chatLabel?: string;
		events?: CreateTelegramIntegrationInput["events"];
	},
	apiKeyId?: string,
) {
	const input: CreateTelegramIntegrationInput = {
		projectId,
		botToken: body.botToken,
		chatId: body.chatId,
		threadId: body.threadId,
		chatLabel: body.chatLabel,
		events: body.events,
	};

	return createTelegramIntegrationUseCase.execute(userId, apiKeyId, input);
}
