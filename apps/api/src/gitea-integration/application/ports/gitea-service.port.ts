import type { Repository, VerificationResult } from "../../domain";

export interface GiteaServicePort {
	listRepositories(
		baseUrl: string,
		accessToken: string,
	): Promise<{ repositories: Repository[] }>;
	verifyAccess(input: {
		baseUrl: string;
		accessToken: string;
		repositoryOwner: string;
		repositoryName: string;
	}): Promise<VerificationResult>;
}
