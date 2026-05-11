import type { TaskWithRelations } from "../../domain";
import type { EventPublisher } from "../ports/event-publisher.port";
import type { TaskRepository } from "../ports/task-repository.port";

export class DeleteTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		currentUserId: string,
	): Promise<TaskWithRelations> {
		const task = await this.taskRepository.findById(taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		const deletedTask = await this.taskRepository.delete(taskId);

		await this.eventPublisher.publish("task.deleted", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
		});

		return deletedTask;
	}
}
