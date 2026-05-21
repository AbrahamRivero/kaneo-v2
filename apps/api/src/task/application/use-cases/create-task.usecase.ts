import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { CreateTaskInput, TaskWithRelations } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class CreateTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: CreateTaskInput): Promise<TaskWithRelations> {
		const task = await this.taskRepository.create(input);

		await this.eventPublisher.publish("task.created", {
			...task,
			taskId: task.id,
			userId: task.createdBy ?? task.userId ?? "",
			assigneeId: task.userId ?? null,
			currentUserId: input.currentUserId,
			type: "created",
			content: null,
		});

		return task;
	}
}
