import { DeleteGiteaIntegrationUseCase } from "../application/use-cases";
import { giteaIntegrationRepository } from "../infrastructure/repositories/drizzle-gitea-integration.repository";

async function deleteGiteaIntegration(projectId: string) {
	const useCase = new DeleteGiteaIntegrationUseCase(giteaIntegrationRepository);
	return useCase.execute(projectId);
}

export default deleteGiteaIntegration;
