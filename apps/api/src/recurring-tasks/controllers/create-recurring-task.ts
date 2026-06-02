import { createRecurringTaskUseCases } from "../application";
import type { CreateRecurringTaskInput } from "../domain";

const { createRecurringTask } = createRecurringTaskUseCases();

async function createRecurringTaskController(input: CreateRecurringTaskInput) {
	return createRecurringTask.execute(input);
}

export default createRecurringTaskController;
