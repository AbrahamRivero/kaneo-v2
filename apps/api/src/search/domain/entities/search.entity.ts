export type SearchType =
	| "all"
	| "tasks"
	| "projects"
	| "workspaces"
	| "comments"
	| "activities";

export type SearchResultType =
	| "task"
	| "project"
	| "workspace"
	| "comment"
	| "activity";

export type SearchParams = {
	query: string;
	userEmail?: string;
	userId?: string;
	type?: SearchType;
	workspaceId?: string;
	projectId?: string;
	limit?: number;
};

export type SearchResult = {
	id: string;
	type: SearchResultType;
	title: string;
	description?: string;
	content?: string;
	projectId?: string;
	projectName?: string;
	workspaceId?: string;
	workspaceName?: string;
	userId?: string;
	userName?: string;
	createdAt: Date;
	relevanceScore: number;
	taskNumber?: number;
	projectSlug?: string;
	priority?: string;
	status?: string;
};

export type SearchResponse = {
	results: SearchResult[];
	totalCount: number;
	searchQuery: string;
};
