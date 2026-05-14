import { VerifyGitHubInstallationUseCase } from "../application/use-cases";
import { githubService } from "../infrastructure/services/github.service";

async function verifyGithubInstallation({
	repositoryOwner,
	repositoryName,
}: {
	repositoryOwner: string;
	repositoryName: string;
}) {
	const useCase = new VerifyGitHubInstallationUseCase(githubService);
	return useCase.execute(repositoryOwner, repositoryName);
}

export default verifyGithubInstallation;
