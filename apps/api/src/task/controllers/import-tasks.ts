import { createTaskUseCases } from "../application";
import type { ImportTask } from "../domain";

const { importTasks: importTasksUseCase } = createTaskUseCases();

async function importTasks(
	projectId: string,
	tasksToImport: ImportTask[],
	currentUserId?: string,
) {
	return importTasksUseCase.execute({
		projectId,
		tasks: tasksToImport,
		currentUserId: currentUserId ?? "",
	});
}

export default importTasks;
