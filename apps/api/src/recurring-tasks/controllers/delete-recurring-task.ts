import { createRecurringTaskUseCases } from "../application";

const { deleteRecurringTask } = createRecurringTaskUseCases();

async function deleteRecurringTaskController(
	recurringTaskId: string,
	userId?: string,
) {
	return deleteRecurringTask.execute(recurringTaskId, userId);
}

export default deleteRecurringTaskController;
