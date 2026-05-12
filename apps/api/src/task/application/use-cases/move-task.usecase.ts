import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { MoveTaskInput, MoveTaskResult } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class MoveTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: MoveTaskInput): Promise<MoveTaskResult> {
		const result = await this.taskRepository.move(input);

		await this.eventPublisher.publish("task.moved", {
			taskId: result.task.id,
			sourceProjectId: result.sourceProjectId,
			destinationProjectId: result.destinationProjectId,
			userId: input.currentUserId,
		});

		return result;
	}
}
