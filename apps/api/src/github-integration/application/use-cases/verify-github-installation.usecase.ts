import type { VerificationResult } from "../../domain";
import type { GitHubServicePort } from "../ports";

export class VerifyGitHubInstallationUseCase {
	constructor(private service: GitHubServicePort) {}

	async execute(
		repositoryOwner: string,
		repositoryName: string,
	): Promise<VerificationResult> {
		return this.service.verifyInstallation(repositoryOwner, repositoryName);
	}
}
