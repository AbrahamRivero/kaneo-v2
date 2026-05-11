import { createTaskUseCases } from "../application";

const { updateTaskDueDate: updateTaskDueDateUseCase } = createTaskUseCases();

async function updateTaskDueDate({
	id,
	dueDate,
	currentUserId,
}: {
	id: string;
	dueDate: Date | null;
	currentUserId: string;
}) {
	return updateTaskDueDateUseCase.execute(id, dueDate, currentUserId);
}

export default updateTaskDueDate;
