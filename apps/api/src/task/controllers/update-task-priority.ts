import { createTaskUseCases } from "../application";
import type { TaskPriority } from "../domain";

const { updateTaskPriority: updateTaskPriorityUseCase } = createTaskUseCases();

async function updateTaskPriority({
	id,
	priority,
	currentUserId,
}: {
	id: string;
	priority: string;
	currentUserId: string;
}) {
	return updateTaskPriorityUseCase.execute(
		id,
		priority as TaskPriority,
		currentUserId,
	);
}

export default updateTaskPriority;
