import { CreateGiteaIntegrationUseCase } from "../application/use-cases";
import { giteaIntegrationRepository } from "../infrastructure/repositories/drizzle-gitea-integration.repository";

async function createGiteaIntegration(input: {
	projectId: string;
	baseUrl: string;
	accessToken?: string;
	repositoryOwner: string;
	repositoryName: string;
}) {
	const useCase = new CreateGiteaIntegrationUseCase(giteaIntegrationRepository);
	return useCase.execute(input);
}

export default createGiteaIntegration;
