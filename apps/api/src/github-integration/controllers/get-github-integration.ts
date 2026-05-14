import { GetGitHubIntegrationUseCase } from "../application/use-cases";
import { githubIntegrationRepository } from "../infrastructure/repositories/drizzle-github-integration.repository";

async function getGithubIntegration(projectId: string) {
	const useCase = new GetGitHubIntegrationUseCase(githubIntegrationRepository);
	return useCase.execute(projectId);
}

export default getGithubIntegration;
