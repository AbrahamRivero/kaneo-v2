import { HTTPException } from "hono/http-exception";
import type { TimeEntry } from "../../domain";
import type { TimeEntryRepository } from "../ports";

export class UpdateTimeEntryUseCase {
	constructor(private timeEntryRepository: TimeEntryRepository) {}

	async execute(input: {
		timeEntryId: string;
		startTime: Date;
		endTime?: Date;
		description?: string;
	}): Promise<TimeEntry> {
		const existing = await this.timeEntryRepository.findById(input.timeEntryId);

		if (!existing) {
			throw new HTTPException(404, {
				message: "Time entry not found",
			});
		}

		return this.timeEntryRepository.update({
			timeEntryId: input.timeEntryId,
			startTime: input.startTime,
			endTime: input.endTime,
			description: input.description,
		});
	}
}
