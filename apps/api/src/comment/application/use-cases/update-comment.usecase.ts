import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { Comment } from "../../domain";
import type { CommentRepository, EventPublisher } from "../ports";

export class UpdateCommentUseCase {
	constructor(
		private commentRepository: CommentRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: {
		userId: string;
		id: string;
		content: string;
	}): Promise<Comment> {
		const existing = await this.commentRepository.findById(input.id);

		if (!existing) {
			throw new HTTPException(404, { message: "Comment not found" });
		}

		if (existing.userId !== input.userId) {
			throw new HTTPException(403, {
				message: "Only the author can edit this comment",
			});
		}

		const task = await this.taskRepository.findById(existing.taskId);

		const updated = await this.commentRepository.update(
			input.id,
			input.content,
		);

		if (task) {
			await this.eventPublisher.publish("comment.updated", {
				...updated,
				taskId: updated.taskId,
				projectId: task.projectId,
				userId: input.userId,
			});
		}

		return updated;
	}
}
