import type { GitHubIntegrationResponse } from "../../domain";
import type { GitHubIntegrationRepository } from "../ports";

export class GetGitHubIntegrationUseCase {
	constructor(private repository: GitHubIntegrationRepository) {}

	async execute(projectId: string): Promise<GitHubIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
