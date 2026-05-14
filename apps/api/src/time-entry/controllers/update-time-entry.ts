import { UpdateTimeEntryUseCase } from "../application/use-cases";
import { timeEntryRepository } from "../infrastructure/repositories/drizzle-time-entry.repository";

const updateTimeEntryUseCase = new UpdateTimeEntryUseCase(timeEntryRepository);

async function updateTimeEntryController({
	timeEntryId,
	startTime,
	endTime,
	description,
}: {
	timeEntryId: string;
	startTime: Date;
	endTime?: Date;
	description?: string;
}) {
	return updateTimeEntryUseCase.execute({
		timeEntryId,
		startTime,
		endTime,
		description,
	});
}

export default updateTimeEntryController;
