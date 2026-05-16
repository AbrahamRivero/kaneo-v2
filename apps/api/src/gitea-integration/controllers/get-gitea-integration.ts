import { GetGiteaIntegrationUseCase } from "../application/use-cases";
import { giteaIntegrationRepository } from "../infrastructure/repositories/drizzle-gitea-integration.repository";

async function getGiteaIntegration(projectId: string) {
	const useCase = new GetGiteaIntegrationUseCase(giteaIntegrationRepository);
	return useCase.execute(projectId);
}

export default getGiteaIntegration;
