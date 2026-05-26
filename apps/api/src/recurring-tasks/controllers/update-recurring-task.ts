import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
	recurringTaskChecklistItemTable,
	recurringTaskTable,
} from "../../database/schema";
import { publishEvent } from "../../events";

type ChecklistItemInput = {
	text: string;
	position: number;
};

type UpdateRecurringTaskInput = {
	title?: string;
	description?: string | null;
	frequency?: string;
	intervalValue?: number;
	dayOfWeek?: number | null;
	dayOfMonth?: number | null;
	cronExpression?: string | null;
	nextRunAt?: Date;
	isActive?: boolean;
	columnId?: string | null;
	assigneeId?: string | null;
	priority?: string | null;
	dueDateDaysOffset?: number | null;
	labelIds?: string[] | null;
	checklistItems?: ChecklistItemInput[];
	userId?: string;
};

async function updateRecurringTask(
	recurringTaskId: string,
	data: UpdateRecurringTaskInput,
) {
	const { userId, checklistItems, ...updateData } = data;
	const [task] = await db
		.update(recurringTaskTable)
		.set(updateData)
		.where(eq(recurringTaskTable.id, recurringTaskId))
		.returning();

	if (!task) {
		throw new HTTPException(404, { message: "Recurring task not found" });
	}

	if (checklistItems) {
		await db
			.delete(recurringTaskChecklistItemTable)
			.where(
				eq(recurringTaskChecklistItemTable.recurringTaskId, recurringTaskId),
			);

		if (checklistItems.length > 0) {
			await db.insert(recurringTaskChecklistItemTable).values(
				checklistItems.map((item) => ({
					id: createId(),
					recurringTaskId,
					text: item.text,
					position: item.position,
				})),
			);
		}
	}

	await publishEvent("recurring_task.updated", {
		recurringTaskId,
		projectId: task.projectId,
		userId: userId ?? "",
	});

	return task;
}

export default updateRecurringTask;
