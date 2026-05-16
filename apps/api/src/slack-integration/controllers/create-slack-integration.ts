import { CreateSlackIntegrationUseCase } from "../application/use-cases";
import type { CreateSlackIntegrationInput } from "../domain";
import { slackIntegrationRepository } from "../infrastructure/repositories/drizzle-slack-integration.repository";

const createSlackIntegrationUseCase = new CreateSlackIntegrationUseCase(
	slackIntegrationRepository,
);

export default async function createSlackIntegration(
	projectId: string,
	body: {
		webhookUrl: string;
		channelName?: string;
		events?: CreateSlackIntegrationInput["events"];
	},
) {
	const input: CreateSlackIntegrationInput = {
		projectId,
		webhookUrl: body.webhookUrl,
		channelName: body.channelName,
		events: body.events,
	};

	return createSlackIntegrationUseCase.execute(input);
}
