import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { BulkOperationInput, BulkOperationResult } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class BulkUpdateTasksUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: BulkOperationInput): Promise<BulkOperationResult> {
		const result = await this.taskRepository.bulkUpdate(input);

		if (result.success && result.updatedCount > 0) {
			for (const taskId of input.taskIds) {
				const taskContext = await this.taskRepository.findTaskContext(taskId);

				await this.eventPublisher.publish("task.bulk_updated", {
					taskId,
					projectId: taskContext?.projectId ?? "",
					operation: input.operation,
					value: input.value,
					userId: input.currentUserId,
				});
			}
		}

		return result;
	}
}
