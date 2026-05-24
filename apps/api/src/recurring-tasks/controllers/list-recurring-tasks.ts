import { eq } from "drizzle-orm";
import db from "../../database";
import { recurringTaskTable } from "../../database/schema";

async function listRecurringTasks(projectId: string) {
	const tasks = await db.query.recurringTaskTable.findMany({
		where: eq(recurringTaskTable.projectId, projectId),
		orderBy: (fields, { desc }) => [desc(fields.createdAt)],
	});

	return tasks;
}

export default listRecurringTasks;
