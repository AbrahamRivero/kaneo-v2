import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { recurringTaskTable } from "../../database/schema";

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
};

async function updateRecurringTask(
	recurringTaskId: string,
	data: UpdateRecurringTaskInput,
) {
	const [task] = await db
		.update(recurringTaskTable)
		.set(data)
		.where(eq(recurringTaskTable.id, recurringTaskId))
		.returning();

	if (!task) {
		throw new HTTPException(404, { message: "Recurring task not found" });
	}

	return task;
}

export default updateRecurringTask;
