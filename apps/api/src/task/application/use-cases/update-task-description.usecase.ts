import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { AssetCleanupPort } from "../ports/asset-cleanup.port";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskDescriptionUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
		private assetCleanup: AssetCleanupPort,
	) {}

	async execute(
		taskId: string,
		description: string,
		currentUserId: string,
	): Promise<Task> {
		const oldTask = await this.taskRepository.findById(taskId);
		if (!oldTask) throw new Error("Task not found");

		const task = await this.taskRepository.updateDescription(
			taskId,
			description,
			currentUserId,
		);

		await this.eventPublisher.publish("task.description_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			oldDescription: oldTask.description,
			newDescription: description,
			type: "description_changed",
		});

		this.assetCleanup
			.cleanupOrphanedAssets(oldTask.description, description, taskId)
			.catch(() => {});

		return task;
	}
}
