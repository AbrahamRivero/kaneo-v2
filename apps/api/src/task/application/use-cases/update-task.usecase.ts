import { HTTPException } from "hono/http-exception";
import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { TaskWithRelations, UpdateTaskInput } from "../../domain";
import type { AssetCleanupPort } from "../ports/asset-cleanup.port";
import type { ColumnQueryPort } from "../ports/column-query.port";
import type { TaskRepository } from "../ports/task-repository.port";
import type { TaskValidatorService } from "../services/task-validator.service";

export class UpdateTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
		private taskValidator: TaskValidatorService,
		private columnQuery: ColumnQueryPort,
		private assetCleanup: AssetCleanupPort,
	) {}

	async execute(input: UpdateTaskInput): Promise<TaskWithRelations> {
		const existingTask = await this.taskRepository.findById(input.id);

		if (!existingTask) {
			throw new HTTPException(404, {
				message: "Task not found",
			});
		}

		const updateData: UpdateTaskInput = { ...input };

		if (input.status !== undefined) {
			const projectId = input.projectId ?? existingTask.projectId;

			await this.taskValidator.assertValidTaskStatus(input.status, projectId);

			const columns = await this.columnQuery.findByProjectId(projectId);
			const column = columns.find((c) => c.slug === input.status);

			updateData.columnId = column?.id ?? null;
		}

		const task = await this.taskRepository.update(updateData);

		if (input.status !== undefined && existingTask.status !== input.status) {
			await this.eventPublisher.publish("task.status_changed", {
				taskId: task.id,
				projectId: task.projectId,
				userId: input.currentUserId,
				oldStatus: existingTask.status,
				newStatus: input.status,
				title: task.title,
				assigneeId: task.userId,
				type: "status_changed",
			});

			await this.eventPublisher.publish("task-relation.refresh", {
				projectId: task.projectId,
				userId: input.currentUserId,
			});
		}

		await this.eventPublisher.publish("task.updated", {
			taskId: task.id,
			projectId: task.projectId,
			title: task.title,
			status: task.status,
			userId: input.currentUserId,
			assigneeId: task.userId,
		});

		if (
			input.description !== undefined &&
			existingTask.description !== input.description
		) {
			this.assetCleanup
				.cleanupOrphanedAssets(
					existingTask.description,
					input.description,
					task.id,
				)
				.catch(() => {});
		}

		return task;
	}
}
