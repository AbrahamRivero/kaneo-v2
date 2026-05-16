import { DeleteDiscordIntegrationUseCase } from "../application/use-cases";
import { discordIntegrationRepository } from "../infrastructure/repositories/drizzle-discord-integration.repository";

const deleteDiscordIntegrationUseCase = new DeleteDiscordIntegrationUseCase(
	discordIntegrationRepository,
);

export default async function deleteDiscordIntegration(projectId: string) {
	await deleteDiscordIntegrationUseCase.execute(projectId);
}
