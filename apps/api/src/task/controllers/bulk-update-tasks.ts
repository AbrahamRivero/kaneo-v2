import { createTaskUseCases } from "../application";
import type { BulkOperationInput } from "../domain";

const { bulkUpdateTasks: bulkUpdateTasksUseCase } = createTaskUseCases();

async function bulkUpdateTasks({
	taskIds,
	operation,
	value,
	userId,
}: {
	taskIds: string[];
	operation: BulkOperationInput["operation"];
	value?: string | null;
	userId: string;
}) {
	return bulkUpdateTasksUseCase.execute({
		taskIds,
		operation,
		value,
		currentUserId: userId,
	});
}

export default bulkUpdateTasks;
