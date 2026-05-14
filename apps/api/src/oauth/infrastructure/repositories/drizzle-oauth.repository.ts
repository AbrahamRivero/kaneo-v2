import { and, eq } from "drizzle-orm";
import db, { schema } from "../../../database";
import type { OAuthRepository } from "../../application/ports";
import type { GetIdTokenResult } from "../../domain";

export class DrizzleOAuthRepository implements OAuthRepository {
	async getIdToken(userId: string): Promise<GetIdTokenResult> {
		const [account] = await db
			.select({ idToken: schema.accountTable.idToken })
			.from(schema.accountTable)
			.where(
				and(
					eq(schema.accountTable.userId, userId),
					eq(schema.accountTable.providerId, "custom"),
				),
			)
			.limit(1);

		return { idToken: account?.idToken ?? null };
	}
}

export const oauthRepository = new DrizzleOAuthRepository();
