import type { SearchParams, SearchResult } from "../../domain";

export interface SearchRepository {
	resolveUserIdByEmail(email: string): Promise<string | undefined>;
	getAccessibleWorkspaceIds(userId: string): Promise<string[]>;
	search(
		params: SearchParams & {
			resolvedUserId: string;
			accessibleWorkspaceIds: string[];
		},
	): Promise<SearchResult[]>;
}
