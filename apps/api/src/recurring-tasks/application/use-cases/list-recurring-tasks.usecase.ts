import type { RecurringTaskWithChecklist } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class ListRecurringTasksUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(projectId: string): Promise<RecurringTaskWithChecklist[]> {
		return this.recurringTaskRepository.findByProjectId(projectId);
	}
}
