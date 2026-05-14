import type { TaskRelationWithTasks } from "../../domain";
import type { TaskRelationRepository } from "../ports";

export class GetTaskRelationsUseCase {
	constructor(private taskRelationRepository: TaskRelationRepository) {}

	async execute(taskId: string): Promise<TaskRelationWithTasks[]> {
		return this.taskRelationRepository.findByTaskId(taskId);
	}
}
