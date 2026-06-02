import { HTTPException } from "hono/http-exception";
import type { RecurringTaskChecklistItem } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class DeleteChecklistItemUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(checklistItemId: string): Promise<RecurringTaskChecklistItem> {
		const item =
			await this.recurringTaskRepository.deleteChecklistItem(checklistItemId);

		if (!item) {
			throw new HTTPException(404, {
				message: "Checklist item not found",
			});
		}

		return item;
	}
}
