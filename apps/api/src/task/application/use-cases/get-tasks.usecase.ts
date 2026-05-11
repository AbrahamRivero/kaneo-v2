import type { TaskFilters, TaskListResult } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class GetTasksUseCase {
	constructor(private taskRepository: TaskRepository) {}

	async execute(
		projectId: string,
		filters?: TaskFilters,
	): Promise<TaskListResult> {
		return this.taskRepository.findByProjectId(projectId, filters);
	}
}
