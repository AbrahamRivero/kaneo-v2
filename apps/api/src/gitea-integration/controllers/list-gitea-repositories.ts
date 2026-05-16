import { ListGiteaRepositoriesUseCase } from "../application/use-cases";
import { giteaService } from "../infrastructure/services/gitea.service";

async function listGiteaRepositories({
	baseUrl,
	accessToken,
}: {
	baseUrl: string;
	accessToken: string;
}) {
	const useCase = new ListGiteaRepositoriesUseCase(giteaService);
	return useCase.execute(baseUrl, accessToken);
}

export default listGiteaRepositories;
