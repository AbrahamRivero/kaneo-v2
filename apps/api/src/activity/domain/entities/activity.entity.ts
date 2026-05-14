export interface Activity {
	id: string;
	taskId: string;
	type: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string | null;
	content: string | null;
	eventData: Record<string, unknown> | null;
	externalUserName: string | null;
	externalUserAvatar: string | null;
	externalSource: string | null;
	externalUrl: string | null;
}

export interface CreateActivityInput {
	taskId: string;
	type: string;
	userId: string;
	content: string | null;
	eventData?: Record<string, unknown> | null;
}

export interface CreateCommentInput {
	taskId: string;
	userId: string;
	content: string;
}
