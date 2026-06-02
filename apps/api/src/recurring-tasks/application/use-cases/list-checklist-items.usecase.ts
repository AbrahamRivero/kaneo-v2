import type { RecurringTaskChecklistItem } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class ListChecklistItemsUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(
		recurringTaskId: string,
	): Promise<RecurringTaskChecklistItem[]> {
		return this.recurringTaskRepository.findChecklistItems(recurringTaskId);
	}
}
