import { GetTimeEntriesUseCase } from "../application/use-cases";
import { timeEntryRepository } from "../infrastructure/repositories/drizzle-time-entry.repository";

const getTimeEntriesUseCase = new GetTimeEntriesUseCase(timeEntryRepository);

async function getTimeEntriesByTaskIdController(taskId: string) {
	return getTimeEntriesUseCase.execute(taskId);
}

export default getTimeEntriesByTaskIdController;
