import type { DiscordIntegrationRepository } from "../ports/discord-integration-repository.port";

export class DeleteDiscordIntegrationUseCase {
	constructor(private repository: DiscordIntegrationRepository) {}

	async execute(projectId: string): Promise<void> {
		await this.repository.delete(projectId);
	}
}
