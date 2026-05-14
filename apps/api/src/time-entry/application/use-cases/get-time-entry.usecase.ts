import type { TimeEntry } from "../../domain";
import type { TimeEntryRepository } from "../ports";

export class GetTimeEntryUseCase {
	constructor(private timeEntryRepository: TimeEntryRepository) {}

	async execute(id: string): Promise<TimeEntry | undefined> {
		const entry = await this.timeEntryRepository.findById(id);
		return entry ?? undefined;
	}
}
