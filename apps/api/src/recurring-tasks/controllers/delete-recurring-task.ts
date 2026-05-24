import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { recurringTaskTable } from "../../database/schema";

async function deleteRecurringTask(recurringTaskId: string) {
	const [task] = await db
		.delete(recurringTaskTable)
		.where(eq(recurringTaskTable.id, recurringTaskId))
		.returning();

	if (!task) {
		throw new HTTPException(404, { message: "Recurring task not found" });
	}

	return task;
}

export default deleteRecurringTask;
