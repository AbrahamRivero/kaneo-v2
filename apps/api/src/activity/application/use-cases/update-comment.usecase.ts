import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { Activity } from "../../domain";
import type { ActivityRepository, EventPublisher } from "../ports";

export class UpdateCommentUseCase {
	constructor(
		private activityRepository: ActivityRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: {
		userId: string;
		id: string;
		content: string;
	}): Promise<Activity> {
		const updated = await this.activityRepository.updateContent(
			input.id,
			input.content,
			input.userId,
		);

		if (!updated) {
			throw new HTTPException(404, {
				message: "Comment not found or you are not the author",
			});
		}

		const task = await this.taskRepository.findById(updated.taskId);

		if (task) {
			await this.eventPublisher.publish("comment.updated", {
				...updated,
				projectId: task.projectId,
				userId: input.userId,
			});
		}

		return updated;
	}
}
