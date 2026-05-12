import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { TaskWithRelations, UpdateTaskInput } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: UpdateTaskInput): Promise<TaskWithRelations> {
		const task = await this.taskRepository.update(input);

		await this.eventPublisher.publish("task.updated", {
			...task,
			taskId: task.id,
			userId: task.userId ?? "",
			currentUserId: input.currentUserId,
			type: "updated",
		});

		return task;
	}
}
