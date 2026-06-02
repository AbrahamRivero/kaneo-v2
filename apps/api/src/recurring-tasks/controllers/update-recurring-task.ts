import { createRecurringTaskUseCases } from "../application";
import type { UpdateRecurringTaskInput } from "../domain";

const { updateRecurringTask } = createRecurringTaskUseCases();

async function updateRecurringTaskController(
	recurringTaskId: string,
	input: UpdateRecurringTaskInput & { userId?: string },
) {
	return updateRecurringTask.execute(recurringTaskId, input);
}

export default updateRecurringTaskController;
