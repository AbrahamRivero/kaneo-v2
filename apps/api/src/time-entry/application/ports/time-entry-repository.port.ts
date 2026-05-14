import type { TimeEntry, TimeEntryWithUser } from "../../domain";

export interface CreateTimeEntryInput {
	taskId: string;
	userId: string;
	description?: string;
	startTime: Date;
	endTime?: Date;
	duration?: number;
}

export interface UpdateTimeEntryInput {
	timeEntryId: string;
	startTime: Date;
	endTime?: Date;
	description?: string;
}

export interface TimeEntryRepository {
	findByTaskId(taskId: string): Promise<TimeEntryWithUser[]>;
	findById(id: string): Promise<TimeEntry | null>;
	create(input: CreateTimeEntryInput): Promise<TimeEntry>;
	update(input: UpdateTimeEntryInput): Promise<TimeEntry>;
}
