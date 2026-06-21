import { HTTPException } from "hono/http-exception";
import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { TaskWithRelations } from "../../domain";
import type { AssetCleanupPort } from "../ports/asset-cleanup.port";
import type { TaskRepository } from "../ports/task-repository.port";

export class DeleteTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
		private assetCleanup: AssetCleanupPort,
	) {}

	async execute(
		taskId: string,
		currentUserId: string,
	): Promise<TaskWithRelations> {
		const task = await this.taskRepository.findById(taskId);

		if (!task) {
			throw new HTTPException(404, {
				message: "Task not found",
			});
		}

		const assetKeys = await this.assetCleanup.getTaskAssetKeys(taskId);

		const deletedTask = await this.taskRepository.delete(taskId);

		await this.eventPublisher.publish("task.deleted", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			assigneeId: task.userId,
			title: task.title,
		});

		if (assetKeys.length > 0) {
			this.assetCleanup.deleteS3Keys(assetKeys).catch(() => {});
		}

		return deletedTask;
	}
}
