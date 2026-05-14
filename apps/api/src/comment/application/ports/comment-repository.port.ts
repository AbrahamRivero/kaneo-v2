import type { Comment, CommentWithUser } from "../../domain";

export interface CreateCommentInput {
	taskId: string;
	userId: string;
	content: string;
}

export interface CommentRepository {
	findByTaskId(taskId: string): Promise<CommentWithUser[]>;
	findById(id: string): Promise<Comment | null>;
	create(input: CreateCommentInput): Promise<Comment>;
	update(id: string, content: string): Promise<Comment>;
	delete(id: string): Promise<Comment>;
}
