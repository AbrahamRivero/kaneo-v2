import { UpdateDiscordIntegrationUseCase } from "../application/use-cases";
import type { UpdateDiscordIntegrationInput } from "../domain";
import { discordIntegrationRepository } from "../infrastructure/repositories/drizzle-discord-integration.repository";

const updateDiscordIntegrationUseCase = new UpdateDiscordIntegrationUseCase(
	discordIntegrationRepository,
);

export default async function updateDiscordIntegration(
	projectId: string,
	body: UpdateDiscordIntegrationInput,
) {
	return updateDiscordIntegrationUseCase.execute(projectId, body);
}
