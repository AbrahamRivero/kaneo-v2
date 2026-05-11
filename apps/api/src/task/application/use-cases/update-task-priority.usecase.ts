import type { Task, TaskPriority } from "../../domain";
import type { EventPublisher } from "../ports/event-publisher.port";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskPriorityUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		priority: TaskPriority,
		currentUserId: string,
	): Promise<Task> {
		const task = await this.taskRepository.updatePriority(
			taskId,
			priority,
			currentUserId,
		);

		await this.eventPublisher.publish("task.priority_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			priority: task.priority,
		});

		return task;
	}
}
