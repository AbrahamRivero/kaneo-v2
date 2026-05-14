import { and, desc, eq } from "drizzle-orm";
import db from "../../../database";
import { activityTable } from "../../../database/schema";
import type { ActivityRepository } from "../../application/ports";
import type { Activity, CreateActivityInput } from "../../domain";
import { mapToActivity } from "../mappers/activity.mapper";

export class DrizzleActivityRepository implements ActivityRepository {
	async findByTaskId(taskId: string): Promise<Activity[]> {
		const rows = await db.query.activityTable.findMany({
			where: eq(activityTable.taskId, taskId),
			orderBy: [desc(activityTable.createdAt)],
		});

		return rows.map(mapToActivity);
	}

	async create(input: CreateActivityInput): Promise<Activity | null> {
		const [row] = await db
			.insert(activityTable)
			.values({
				taskId: input.taskId,
				type: input.type,
				userId: input.userId,
				content: input.content,
				eventData: input.eventData ?? null,
			})
			.returning();

		return row ? mapToActivity(row) : null;
	}

	async updateContent(
		id: string,
		content: string,
		userId: string,
	): Promise<Activity | null> {
		const [row] = await db
			.update(activityTable)
			.set({ content })
			.where(and(eq(activityTable.id, id), eq(activityTable.userId, userId)))
			.returning();

		return row ? mapToActivity(row) : null;
	}

	async deleteByIdAndUser(
		id: string,
		userId: string,
	): Promise<Activity | null> {
		const [row] = await db
			.delete(activityTable)
			.where(and(eq(activityTable.id, id), eq(activityTable.userId, userId)))
			.returning();

		return row ? mapToActivity(row) : null;
	}
}

export const activityRepository = new DrizzleActivityRepository();
