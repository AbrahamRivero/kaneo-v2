import type { ExportTasksResult } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class ExportTasksUseCase {
	constructor(private taskRepository: TaskRepository) {}

	async execute(projectId: string): Promise<ExportTasksResult> {
		return this.taskRepository.exportTasks(projectId);
	}
}
