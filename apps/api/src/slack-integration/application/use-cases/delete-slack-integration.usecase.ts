import type { SlackIntegrationRepository } from "../ports/slack-integration-repository.port";

export class DeleteSlackIntegrationUseCase {
	constructor(private repository: SlackIntegrationRepository) {}

	async execute(projectId: string): Promise<void> {
		await this.repository.delete(projectId);
	}
}
