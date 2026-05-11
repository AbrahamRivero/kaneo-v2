import { createTaskUseCases } from "../application";

const { createTask } = createTaskUseCases();

async function createTaskController({
	projectId,
	currentUserId,
	userId,
	title,
	status,
	startDate,
	dueDate,
	description,
	priority,
}: {
	projectId: string;
	currentUserId: string;
	userId?: string;
	title: string;
	status: string;
	startDate?: Date;
	dueDate?: Date;
	description?: string;
	priority?: string;
}) {
	return createTask.execute({
		projectId,
		currentUserId,
		userId,
		title,
		status,
		startDate,
		dueDate,
		description,
		priority: priority as "no-priority" | "low" | "medium" | "high" | "urgent",
	});
}

export default createTaskController;
