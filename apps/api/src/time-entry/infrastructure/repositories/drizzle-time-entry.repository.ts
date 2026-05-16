import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { timeEntryTable, userTable } from "../../../database/schema";
import type {
	CreateTimeEntryInput,
	TimeEntryRepository,
	UpdateTimeEntryInput,
} from "../../application/ports";
import type { TimeEntry, TimeEntryWithUser } from "../../domain";
import {
	mapToTimeEntry,
	mapToTimeEntryWithUser,
} from "../mappers/time-entry.mapper";

export class DrizzleTimeEntryRepository implements TimeEntryRepository {
	async findByTaskId(taskId: string): Promise<TimeEntryWithUser[]> {
		const rows = await db
			.select({
				id: timeEntryTable.id,
				taskId: timeEntryTable.taskId,
				userId: timeEntryTable.userId,
				description: timeEntryTable.description,
				startTime: timeEntryTable.startTime,
				endTime: timeEntryTable.endTime,
				duration: timeEntryTable.duration,
				createdAt: timeEntryTable.createdAt,
				userName: userTable.name,
			})
			.from(timeEntryTable)
			.leftJoin(userTable, eq(timeEntryTable.userId, userTable.id))
			.where(eq(timeEntryTable.taskId, taskId))
			.orderBy(timeEntryTable.startTime);

		return rows.map(mapToTimeEntryWithUser);
	}

	async findById(id: string): Promise<TimeEntry | null> {
		const [row] = await db
			.select()
			.from(timeEntryTable)
			.where(eq(timeEntryTable.id, id));

		return row ? mapToTimeEntry(row) : null;
	}

	async create(input: CreateTimeEntryInput): Promise<TimeEntry> {
		const [row] = await db
			.insert(timeEntryTable)
			.values({
				taskId: input.taskId,
				userId: input.userId,
				description: input.description ?? "",
				startTime: input.startTime,
				endTime: input.endTime ?? null,
				duration: input.duration ?? 0,
			})
			.returning();

		if (!row) {
			throw new HTTPException(500, { message: "Failed to create time entry" });
		}

		return mapToTimeEntry(row);
	}

	async update(input: UpdateTimeEntryInput): Promise<TimeEntry> {
		let duration: number | null = null;
		if (input.endTime) {
			duration = Math.floor(
				(input.endTime.getTime() - input.startTime.getTime()) / 1000,
			);
		}

		const [row] = await db
			.update(timeEntryTable)
			.set({
				startTime: input.startTime,
				endTime: input.endTime ?? null,
				duration,
				...(input.description !== undefined && {
					description: input.description,
				}),
			})
			.where(eq(timeEntryTable.id, input.timeEntryId))
			.returning();

		if (!row) {
			throw new HTTPException(500, { message: "Failed to update time entry" });
		}

		return mapToTimeEntry(row);
	}
}

export const timeEntryRepository = new DrizzleTimeEntryRepository();
