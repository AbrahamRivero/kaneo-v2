import type { CommentWithUser } from "../../domain";
import type { CommentRepository } from "../ports";

export class GetCommentsUseCase {
	constructor(private commentRepository: CommentRepository) {}

	async execute(taskId: string): Promise<CommentWithUser[]> {
		return this.commentRepository.findByTaskId(taskId);
	}
}
