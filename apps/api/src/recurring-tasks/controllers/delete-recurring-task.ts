import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { recurringTaskTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function deleteRecurringTask(recurringTaskId: string, userId?: string) {
	const [task] = await db
		.delete(recurringTaskTable)
		.where(eq(recurringTaskTable.id, recurringTaskId))
		.returning();

	if (!task) {
		throw new HTTPException(404, { message: "Recurring task not found" });
	}

	await publishEvent("recurring_task.deleted", {
		recurringTaskId,
		projectId: task.projectId,
		userId: userId ?? "",
	});

	return task;
}

export default deleteRecurringTask;
