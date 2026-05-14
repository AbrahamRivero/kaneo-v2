import { CreateGitHubIntegrationUseCase } from "../application/use-cases";
import { githubIntegrationRepository } from "../infrastructure/repositories/drizzle-github-integration.repository";

async function createGithubIntegration({
	projectId,
	repositoryOwner,
	repositoryName,
}: {
	projectId: string;
	repositoryOwner: string;
	repositoryName: string;
}) {
	const useCase = new CreateGitHubIntegrationUseCase(
		githubIntegrationRepository,
	);
	return useCase.execute({ projectId, repositoryOwner, repositoryName });
}

export default createGithubIntegration;
