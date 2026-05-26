import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { recurringTaskTable } from "../../database/schema";
import { publishEvent } from "../../events";

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
	userId?: string;
};

async function updateRecurringTask(
	recurringTaskId: string,
	data: UpdateRecurringTaskInput,
) {
	const { userId, ...updateData } = data;
	const [task] = await db
		.update(recurringTaskTable)
		.set(updateData)
		.where(eq(recurringTaskTable.id, recurringTaskId))
		.returning();

	if (!task) {
		throw new HTTPException(404, { message: "Recurring task not found" });
	}

	await publishEvent("recurring_task.updated", {
		recurringTaskId,
		projectId: task.projectId,
		userId: userId ?? "",
	});

	return task;
}

export default updateRecurringTask;
