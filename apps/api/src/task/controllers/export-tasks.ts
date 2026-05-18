import { createTaskUseCases } from "../application";

const { exportTasks: exportTasksUseCase } = createTaskUseCases();

async function exportTasks(projectId: string) {
	return exportTasksUseCase.execute(projectId);
}

export default exportTasks;
