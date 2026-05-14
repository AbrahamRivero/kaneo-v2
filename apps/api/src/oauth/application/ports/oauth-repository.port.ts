import type { GetIdTokenResult } from "../../domain";

export interface OAuthRepository {
	getIdToken(userId: string): Promise<GetIdTokenResult>;
}
