import { createTaskUseCases } from "../application";
import type { TaskPriority } from "../domain";

const { updateTask: updateTaskUseCase } = createTaskUseCases();

async function updateTask(
	id: string,
	title: string,
	status: string,
	startDate: Date | undefined,
	dueDate: Date | undefined,
	projectId: string,
	description: string,
	priority: string,
	position: number,
	userId?: string | null,
	currentUserId?: string,
) {
	return updateTaskUseCase.execute({
		id,
		currentUserId: currentUserId ?? "",
		title,
		status,
		startDate: startDate ?? null,
		dueDate: dueDate ?? null,
		projectId,
		description,
		priority: priority as TaskPriority,
		position,
		userId: userId ?? null,
	});
}

export default updateTask;
