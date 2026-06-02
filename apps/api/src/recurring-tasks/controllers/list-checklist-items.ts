import { createRecurringTaskUseCases } from "../application";

const { listChecklistItems } = createRecurringTaskUseCases();

async function listChecklistItemsController(recurringTaskId: string) {
	return listChecklistItems.execute(recurringTaskId);
}

export default listChecklistItemsController;
