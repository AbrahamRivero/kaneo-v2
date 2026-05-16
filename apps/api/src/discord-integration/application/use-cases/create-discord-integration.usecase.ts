import type {
	CreateDiscordIntegrationInput,
	DiscordIntegrationResponse,
} from "../../domain";
import type { DiscordIntegrationRepository } from "../ports/discord-integration-repository.port";

export class CreateDiscordIntegrationUseCase {
	constructor(private repository: DiscordIntegrationRepository) {}

	async execute(
		input: CreateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse> {
		return this.repository.create(input);
	}
}
