import { GetTelegramIntegrationUseCase } from "../application/use-cases";
import { telegramIntegrationRepository } from "../infrastructure/repositories/drizzle-telegram-integration.repository";

const getTelegramIntegrationUseCase = new GetTelegramIntegrationUseCase(
	telegramIntegrationRepository,
);

export default async function getTelegramIntegration(projectId: string) {
	return getTelegramIntegrationUseCase.execute(projectId);
}
