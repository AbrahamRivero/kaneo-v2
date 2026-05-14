export interface OAuthAccount {
	id: string;
	userId: string;
	providerId: string;
	providerAccountId: string | null;
	refreshToken: string | null;
	accessToken: string | null;
	expiresAt: number | null;
	scope: string | null;
	idToken: string | null;
	sessionState: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface GetIdTokenResult {
	idToken: string | null;
}
