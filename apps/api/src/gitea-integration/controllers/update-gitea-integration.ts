import { UpdateGiteaIntegrationUseCase } from "../application/use-cases";
import { giteaIntegrationRepository } from "../infrastructure/repositories/drizzle-gitea-integration.repository";

async function updateGiteaIntegration(
	projectId: string,
	input: { isActive?: boolean; commentTaskLinkOnGiteaIssue?: boolean },
) {
	const useCase = new UpdateGiteaIntegrationUseCase(giteaIntegrationRepository);
	return useCase.execute(projectId, input);
}

export default updateGiteaIntegration;
