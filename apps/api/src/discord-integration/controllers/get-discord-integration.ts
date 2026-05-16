import { GetDiscordIntegrationUseCase } from "../application/use-cases";
import { discordIntegrationRepository } from "../infrastructure/repositories/drizzle-discord-integration.repository";

const getDiscordIntegrationUseCase = new GetDiscordIntegrationUseCase(
	discordIntegrationRepository,
);

export default async function getDiscordIntegration(projectId: string) {
	return getDiscordIntegrationUseCase.execute(projectId);
}
