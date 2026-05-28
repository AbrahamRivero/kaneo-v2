import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskStatusUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		status: string,
		currentUserId: string,
	): Promise<Task> {
		const oldTask = await this.taskRepository.findById(taskId);
		if (!oldTask) throw new Error("Task not found");

		const task = await this.taskRepository.updateStatus(
			taskId,
			status,
			currentUserId,
		);

		await this.eventPublisher.publish("task.status_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			oldStatus: oldTask.status,
			newStatus: status,
			title: task.title,
			assigneeId: task.userId,
			type: "status_changed",
		});

		await this.eventPublisher.publish("task-relation.refresh", {
			projectId: task.projectId,
			userId: currentUserId,
		});

		return task;
	}
}
