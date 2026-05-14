import type { TimeEntry, TimeEntryWithUser } from "../../domain";

type TimeEntryRow = {
	id: string;
	taskId: string;
	userId: string | null;
	description: string | null;
	startTime: Date;
	endTime: Date | null;
	duration: number | null;
	createdAt: Date;
};

type TimeEntryWithUserRow = TimeEntryRow & {
	userName: string | null;
};

export function mapToTimeEntry(row: TimeEntryRow): TimeEntry {
	return {
		id: row.id,
		taskId: row.taskId,
		userId: row.userId,
		description: row.description,
		startTime: row.startTime,
		endTime: row.endTime,
		duration: row.duration,
		createdAt: row.createdAt,
	};
}

export function mapToTimeEntryWithUser(
	row: TimeEntryWithUserRow,
): TimeEntryWithUser {
	return {
		...mapToTimeEntry(row),
		userName: row.userName,
	};
}
