import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { Comment } from "../../domain";
import type { CommentRepository, EventPublisher } from "../ports";

export class CreateCommentUseCase {
	constructor(
		private commentRepository: CommentRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: {
		taskId: string;
		userId: string;
		content: string;
	}): Promise<Comment> {
		const task = await this.taskRepository.findById(input.taskId);

		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const comment = await this.commentRepository.create({
			taskId: input.taskId,
			userId: input.userId,
			content: input.content,
		});

		await this.eventPublisher.publish("comment.created", {
			...comment,
			taskId: comment.taskId,
			projectId: task.projectId,
			userId: input.userId,
		});

		return comment;
	}
}
