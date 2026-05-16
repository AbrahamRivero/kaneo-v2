import type { SearchParams, SearchResponse } from "../../domain";
import type { SearchRepository } from "../ports/search-repository.port";

export class GlobalSearchUseCase {
	constructor(private searchRepository: SearchRepository) {}

	async execute(params: SearchParams): Promise<SearchResponse> {
		const {
			query,
			userId,
			userEmail,
			type = "all",
			workspaceId,
			projectId,
			limit = 20,
		} = params;

		let resolvedUserId = userId;

		if (!resolvedUserId && userEmail) {
			resolvedUserId =
				await this.searchRepository.resolveUserIdByEmail(userEmail);
		}

		if (!resolvedUserId) {
			return { results: [], totalCount: 0, searchQuery: query };
		}

		const accessibleWorkspaceIds =
			await this.searchRepository.getAccessibleWorkspaceIds(resolvedUserId);

		if (accessibleWorkspaceIds.length === 0) {
			return { results: [], totalCount: 0, searchQuery: query };
		}

		const results = await this.searchRepository.search({
			query,
			type,
			workspaceId,
			projectId,
			limit,
			resolvedUserId,
			accessibleWorkspaceIds,
		});

		results.sort((a, b) => {
			if (a.relevanceScore !== b.relevanceScore) {
				return b.relevanceScore - a.relevanceScore;
			}
			return b.createdAt.getTime() - a.createdAt.getTime();
		});

		const finalResults = results.slice(0, limit);

		return {
			results: finalResults,
			totalCount: results.length,
			searchQuery: query,
		};
	}
}
