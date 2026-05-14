import type {
	GitHubIntegrationResponse,
	UpdateGithubIntegrationInput,
} from "../../domain";
import type { GitHubIntegrationRepository } from "../ports";

export class UpdateGitHubIntegrationUseCase {
	constructor(private repository: GitHubIntegrationRepository) {}

	async execute(
		projectId: string,
		input: UpdateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse> {
		return this.repository.update(projectId, input);
	}
}
