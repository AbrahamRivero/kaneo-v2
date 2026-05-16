import type {
	SlackIntegrationResponse,
	UpdateSlackIntegrationInput,
} from "../../domain";
import type { SlackIntegrationRepository } from "../ports/slack-integration-repository.port";

export class UpdateSlackIntegrationUseCase {
	constructor(private repository: SlackIntegrationRepository) {}

	async execute(
		projectId: string,
		input: UpdateSlackIntegrationInput,
	): Promise<SlackIntegrationResponse> {
		return this.repository.update(projectId, input);
	}
}
