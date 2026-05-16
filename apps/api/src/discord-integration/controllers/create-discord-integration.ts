import { CreateDiscordIntegrationUseCase } from "../application/use-cases";
import type { CreateDiscordIntegrationInput } from "../domain";
import { discordIntegrationRepository } from "../infrastructure/repositories/drizzle-discord-integration.repository";

const createDiscordIntegrationUseCase = new CreateDiscordIntegrationUseCase(
	discordIntegrationRepository,
);

export default async function createDiscordIntegration(
	projectId: string,
	body: {
		webhookUrl: string;
		channelName?: string;
		events?: CreateDiscordIntegrationInput["events"];
	},
) {
	const input: CreateDiscordIntegrationInput = {
		projectId,
		webhookUrl: body.webhookUrl,
		channelName: body.channelName,
		events: body.events,
	};

	return createDiscordIntegrationUseCase.execute(input);
}
