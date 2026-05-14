import { GetIdTokenUseCase } from "../application/use-cases";
import { oauthRepository } from "../infrastructure/repositories/drizzle-oauth.repository";

async function getIdToken(userId: string) {
	const useCase = new GetIdTokenUseCase(oauthRepository);
	return useCase.execute(userId);
}

export default getIdToken;
