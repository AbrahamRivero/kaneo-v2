import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskTitleUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		title: string,
		currentUserId: string,
	): Promise<Task> {
		const task = await this.taskRepository.updateTitle(
			taskId,
			title,
			currentUserId,
		);

		await this.eventPublisher.publish("task.title_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			title: task.title,
		});

		return task;
	}
}
