import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskDueDateUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		dueDate: Date | null,
		currentUserId: string,
	): Promise<Task> {
		const existingTask = await this.taskRepository.findById(taskId);

		const oldDueDate = existingTask?.dueDate ?? null;

		const task = await this.taskRepository.updateDueDate(
			taskId,
			dueDate,
			currentUserId,
		);

		await this.eventPublisher.publish("task.due_date_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			oldDueDate,
			newDueDate: task.dueDate,
			title: task.title,
			type: "due_date_changed",
		});

		return task;
	}
}
