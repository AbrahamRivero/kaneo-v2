import { createRecurringTaskUseCases } from "../application";

const { deleteChecklistItem } = createRecurringTaskUseCases();

async function deleteChecklistItemController(checklistItemId: string) {
	return deleteChecklistItem.execute(checklistItemId);
}

export default deleteChecklistItemController;
