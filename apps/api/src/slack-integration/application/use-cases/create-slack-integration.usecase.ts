import type {
	CreateSlackIntegrationInput,
	SlackIntegrationResponse,
} from "../../domain";
import type { SlackIntegrationRepository } from "../ports/slack-integration-repository.port";

export class CreateSlackIntegrationUseCase {
	constructor(private repository: SlackIntegrationRepository) {}

	async execute(
		input: CreateSlackIntegrationInput,
	): Promise<SlackIntegrationResponse> {
		return this.repository.create(input);
	}
}
