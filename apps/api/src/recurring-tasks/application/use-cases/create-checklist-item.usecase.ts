import type {
	CreateChecklistItemInput,
	RecurringTaskChecklistItem,
} from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class CreateChecklistItemUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(
		input: CreateChecklistItemInput,
	): Promise<RecurringTaskChecklistItem> {
		return this.recurringTaskRepository.createChecklistItem(input);
	}
}
