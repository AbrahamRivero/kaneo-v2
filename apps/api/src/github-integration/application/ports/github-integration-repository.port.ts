import type {
	CreateGithubIntegrationInput,
	GitHubIntegrationResponse,
	UpdateGithubIntegrationInput,
} from "../../domain";

export interface GitHubIntegrationRepository {
	findByProjectId(projectId: string): Promise<GitHubIntegrationResponse | null>;
	create(
		input: CreateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse>;
	delete(projectId: string): Promise<{ success: boolean; message: string }>;
}
