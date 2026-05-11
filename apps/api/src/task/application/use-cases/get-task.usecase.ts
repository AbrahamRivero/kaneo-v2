import type { TaskWithRelations } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class GetTaskUseCase {
	constructor(private taskRepository: TaskRepository) {}

	async execute(taskId: string): Promise<TaskWithRelations> {
		const task = await this.taskRepository.findById(taskId);
		if (!task) {
			throw new Error("Task not found");
		}
		return task;
	}
}
