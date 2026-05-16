import type {
	DiscordIntegrationResponse,
	UpdateDiscordIntegrationInput,
} from "../../domain";
import type { DiscordIntegrationRepository } from "../ports/discord-integration-repository.port";

export class UpdateDiscordIntegrationUseCase {
	constructor(private repository: DiscordIntegrationRepository) {}

	async execute(
		projectId: string,
		input: UpdateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse> {
		return this.repository.update(projectId, input);
	}
}
