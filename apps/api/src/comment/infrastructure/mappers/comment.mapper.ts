import type { Comment, CommentWithUser } from "../../domain";

type CommentRow = {
	id: string;
	taskId: string;
	userId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};

type CommentWithUserRow = CommentRow & {
	userName: string | null;
	userImage: string | null;
};

export function mapToComment(row: CommentRow): Comment {
	return {
		id: row.id,
		taskId: row.taskId,
		userId: row.userId,
		content: row.content,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapToCommentWithUser(row: CommentWithUserRow): CommentWithUser {
	return {
		...mapToComment(row),
		user: {
			name: row.userName ?? "",
			image: row.userImage,
		},
	};
}
