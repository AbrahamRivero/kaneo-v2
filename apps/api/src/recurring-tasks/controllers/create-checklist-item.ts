import { createRecurringTaskUseCases } from "../application";
import type { CreateChecklistItemInput } from "../domain";

const { createChecklistItem } = createRecurringTaskUseCases();

async function createChecklistItemController(input: CreateChecklistItemInput) {
	return createChecklistItem.execute(input);
}

export default createChecklistItemController;
