import type { GitHubIntegrationRepository } from "../ports";

export class DeleteGitHubIntegrationUseCase {
	constructor(private repository: GitHubIntegrationRepository) {}

	async execute(projectId: string) {
		return this.repository.delete(projectId);
	}
}
