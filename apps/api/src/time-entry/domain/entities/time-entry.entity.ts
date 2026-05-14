export interface TimeEntry {
	id: string;
	taskId: string;
	userId: string | null;
	description: string | null;
	startTime: Date;
	endTime: Date | null;
	duration: number | null;
	createdAt: Date;
}

export interface TimeEntryWithUser extends TimeEntry {
	userName: string | null;
}
