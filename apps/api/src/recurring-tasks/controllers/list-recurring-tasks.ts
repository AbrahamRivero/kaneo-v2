import { eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
	recurringTaskChecklistItemTable,
	recurringTaskTable,
} from "../../database/schema";

async function listRecurringTasks(projectId: string) {
	const tasks = await db.query.recurringTaskTable.findMany({
		where: eq(recurringTaskTable.projectId, projectId),
		orderBy: (fields, { desc }) => [desc(fields.createdAt)],
	});

	if (tasks.length === 0) return tasks;

	const taskIds = tasks.map((t) => t.id);
	const checklistItems = await db
		.select()
		.from(recurringTaskChecklistItemTable)
		.where(inArray(recurringTaskChecklistItemTable.recurringTaskId, taskIds))
		.orderBy(recurringTaskChecklistItemTable.position);

	const grouped = new Map<string, typeof checklistItems>();
	for (const item of checklistItems) {
		const list = grouped.get(item.recurringTaskId);
		if (list) {
			list.push(item);
		} else {
			grouped.set(item.recurringTaskId, [item]);
		}
	}

	return tasks.map((task) => ({
		...task,
		checklistItems: grouped.get(task.id) ?? [],
	}));
}

export default listRecurringTasks;
