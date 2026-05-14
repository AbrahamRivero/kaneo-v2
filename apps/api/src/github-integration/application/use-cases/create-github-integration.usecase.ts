import type {
	CreateGithubIntegrationInput,
	GitHubIntegrationResponse,
} from "../../domain";
import type { GitHubIntegrationRepository } from "../ports";

export class CreateGitHubIntegrationUseCase {
	constructor(private repository: GitHubIntegrationRepository) {}

	async execute(
		input: CreateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse> {
		return this.repository.create(input);
	}
}
