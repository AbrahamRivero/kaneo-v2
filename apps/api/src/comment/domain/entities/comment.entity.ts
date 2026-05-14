export interface Comment {
	id: string;
	taskId: string;
	userId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CommentWithUser extends Comment {
	user: {
		name: string;
		image: string | null;
	};
}
