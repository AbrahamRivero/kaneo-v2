import type { DiscordIntegrationResponse } from "../../domain";
import type { DiscordIntegrationRepository } from "../ports/discord-integration-repository.port";

export class GetDiscordIntegrationUseCase {
	constructor(private repository: DiscordIntegrationRepository) {}

	async execute(projectId: string): Promise<DiscordIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
