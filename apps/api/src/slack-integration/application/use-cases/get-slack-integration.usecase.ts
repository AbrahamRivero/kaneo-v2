import type { SlackIntegrationResponse } from "../../domain";
import type { SlackIntegrationRepository } from "../ports/slack-integration-repository.port";

export class GetSlackIntegrationUseCase {
	constructor(private repository: SlackIntegrationRepository) {}

	async execute(projectId: string): Promise<SlackIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
