import { createTaskUseCases } from "../application";

const { deleteTask: deleteTaskUseCase } = createTaskUseCases();

async function deleteTask(taskId: string, currentUserId: string) {
	return deleteTaskUseCase.execute(taskId, currentUserId);
}

export default deleteTask;
