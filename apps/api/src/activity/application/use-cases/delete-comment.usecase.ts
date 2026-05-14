import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { Activity } from "../../domain";
import type { ActivityRepository, EventPublisher } from "../ports";

export class DeleteCommentUseCase {
	constructor(
		private activityRepository: ActivityRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: { userId: string; id: string }): Promise<Activity> {
		const deleted = await this.activityRepository.deleteByIdAndUser(
			input.id,
			input.userId,
		);

		if (!deleted) {
			throw new HTTPException(404, {
				message: "Comment not found or you are not the author",
			});
		}

		const task = await this.taskRepository.findById(deleted.taskId);

		if (task) {
			await this.eventPublisher.publish("comment.deleted", {
				...deleted,
				projectId: task.projectId,
				userId: input.userId,
			});
		}

		return deleted;
	}
}
