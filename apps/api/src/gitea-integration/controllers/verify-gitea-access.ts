import { VerifyGiteaAccessUseCase } from "../application/use-cases";
import { giteaService } from "../infrastructure/services/gitea.service";

async function verifyGiteaAccess(input: {
	baseUrl: string;
	accessToken: string;
	repositoryOwner: string;
	repositoryName: string;
}) {
	const useCase = new VerifyGiteaAccessUseCase(giteaService);
	return useCase.execute(input);
}

export default verifyGiteaAccess;
