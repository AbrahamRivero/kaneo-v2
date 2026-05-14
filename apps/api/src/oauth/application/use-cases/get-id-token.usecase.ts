import type { GetIdTokenResult } from "../../domain";
import type { OAuthRepository } from "../ports";

export class GetIdTokenUseCase {
	constructor(private oauthRepository: OAuthRepository) {}

	async execute(userId: string): Promise<GetIdTokenResult> {
		return this.oauthRepository.getIdToken(userId);
	}
}
