import type { ListRepositoriesResult, VerificationResult } from "../../domain";

export interface GitHubServicePort {
	verifyInstallation(
		repositoryOwner: string,
		repositoryName: string,
	): Promise<VerificationResult>;
	listUserRepositories(): Promise<ListRepositoriesResult>;
}
