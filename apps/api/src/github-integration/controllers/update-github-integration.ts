import { UpdateGitHubIntegrationUseCase } from "../application/use-cases";
import { githubIntegrationRepository } from "../infrastructure/repositories/drizzle-github-integration.repository";

async function updateGithubIntegration(
	projectId: string,
	input: { isActive?: boolean; commentTaskLinkOnGitHubIssue?: boolean },
) {
	const useCase = new UpdateGitHubIntegrationUseCase(
		githubIntegrationRepository,
	);
	return useCase.execute(projectId, input);
}

export default updateGithubIntegration;
