import { publishEvent } from "../../events";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { CreateTimeEntryUseCase } from "../application/use-cases";
import { timeEntryRepository } from "../infrastructure/repositories/drizzle-time-entry.repository";

const taskRepository = new DrizzleTaskRepository();

const createTimeEntryUseCase = new CreateTimeEntryUseCase(
	timeEntryRepository,
	taskRepository,
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function createTimeEntryController({
	taskId,
	userId,
	description,
	startTime,
	endTime,
}: {
	taskId: string;
	userId: string;
	description?: string;
	startTime: Date;
	endTime?: Date;
}) {
	return createTimeEntryUseCase.execute({
		taskId,
		userId,
		description,
		startTime,
		endTime,
	});
}

export default createTimeEntryController;
