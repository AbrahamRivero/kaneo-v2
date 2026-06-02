import { createRecurringTaskUseCases } from "../application";

const { listRecurringTasks } = createRecurringTaskUseCases();

async function listRecurringTasksController(projectId: string) {
	return listRecurringTasks.execute(projectId);
}

export default listRecurringTasksController;
