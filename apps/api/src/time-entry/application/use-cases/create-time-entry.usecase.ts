import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { TimeEntry } from "../../domain";
import type { EventPublisher, TimeEntryRepository } from "../ports";

export class CreateTimeEntryUseCase {
	constructor(
		private timeEntryRepository: TimeEntryRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: {
		taskId: string;
		userId: string;
		description?: string;
		startTime: Date;
		endTime?: Date;
	}): Promise<TimeEntry> {
		const timeEntry = await this.timeEntryRepository.create({
			taskId: input.taskId,
			userId: input.userId,
			description: input.description,
			startTime: input.startTime,
			endTime: input.endTime,
		});

		if (!timeEntry) {
			throw new HTTPException(500, {
				message: "Failed to create time entry",
			});
		}

		const task = await this.taskRepository.findById(input.taskId);

		await this.eventPublisher.publish("time-entry.created", {
			timeEntryId: timeEntry.id,
			taskId: timeEntry.taskId,
			userId: input.userId,
			type: "create",
			content: "started time tracking",
			taskOwnerId: task?.userId,
			taskTitle: task?.title,
		});

		return timeEntry;
	}
}
