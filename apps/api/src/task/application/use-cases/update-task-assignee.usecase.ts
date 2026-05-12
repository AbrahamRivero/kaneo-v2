import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskAssigneeUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		userId: string,
		currentUserId: string,
	): Promise<Task> {
		const task = await this.taskRepository.updateAssignee(
			taskId,
			userId,
			currentUserId,
		);

		await this.eventPublisher.publish("task.assignee_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			assigneeId: userId,
		});

		return task;
	}
}
