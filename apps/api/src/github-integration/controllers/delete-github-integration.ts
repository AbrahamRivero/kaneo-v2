import { DeleteGitHubIntegrationUseCase } from "../application/use-cases";
import { githubIntegrationRepository } from "../infrastructure/repositories/drizzle-github-integration.repository";

async function deleteGithubIntegration(projectId: string) {
	const useCase = new DeleteGitHubIntegrationUseCase(
		githubIntegrationRepository,
	);
	return useCase.execute(projectId);
}

export default deleteGithubIntegration;
