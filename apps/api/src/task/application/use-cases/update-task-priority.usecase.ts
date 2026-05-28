import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task, TaskPriority } from "../../domain";
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
		const oldTask = await this.taskRepository.findById(taskId);
		if (!oldTask) throw new Error("Task not found");

		const task = await this.taskRepository.updatePriority(
			taskId,
			priority,
			currentUserId,
		);

		await this.eventPublisher.publish("task.priority_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			oldPriority: oldTask.priority,
			newPriority: task.priority,
			title: task.title,
			type: "priority_changed",
		});

		await this.eventPublisher.publish("task-relation.refresh", {
			projectId: task.projectId,
			userId: currentUserId,
		});

		return task;
	}
}
