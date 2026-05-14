import type { TimeEntryWithUser } from "../../domain";
import type { TimeEntryRepository } from "../ports";

export class GetTimeEntriesUseCase {
	constructor(private timeEntryRepository: TimeEntryRepository) {}

	async execute(taskId: string): Promise<TimeEntryWithUser[]> {
		return this.timeEntryRepository.findByTaskId(taskId);
	}
}
