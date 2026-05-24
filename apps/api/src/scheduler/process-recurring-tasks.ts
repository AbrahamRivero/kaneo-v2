import { createId } from "@paralleldrive/cuid2";
import { and, eq, lte, max } from "drizzle-orm";
import db from "../database";
import {
	projectTable,
	recurringTaskTable,
	taskTable,
} from "../database/schema";

function computeNextRun(task: typeof recurringTaskTable.$inferSelect): Date {
	const now = new Date();
	const next = new Date(task.nextRunAt);
	const interval = task.intervalValue ?? 1;

	switch (task.frequency) {
		case "daily": {
			next.setDate(next.getDate() + interval);
			break;
		}
		case "weekly": {
			next.setDate(next.getDate() + 7 * interval);
			break;
		}
		case "monthly": {
			next.setMonth(next.getMonth() + interval);
			break;
		}
		default: {
			next.setDate(next.getDate() + interval);
			break;
		}
	}

	if (next <= now) {
		const diff = now.getTime() - next.getTime();
		const cycles =
			Math.floor(diff / (next.getTime() - task.nextRunAt.getTime())) + 1;
		next.setTime(
			next.getTime() + cycles * (next.getTime() - task.nextRunAt.getTime()),
		);
	}

	return next;
}

export async function processRecurringTasks(): Promise<void> {
	const now = new Date();

	const dueTasks = await db
		.select()
		.from(recurringTaskTable)
		.where(
			and(
				eq(recurringTaskTable.isActive, true),
				lte(recurringTaskTable.nextRunAt, now),
			),
		);

	for (const recurring of dueTasks) {
		try {
			const project = await db.query.projectTable.findFirst({
				where: eq(projectTable.id, recurring.projectId),
			});

			if (!project) continue;

			const taskId = createId();

			const [maxNumberResult] = await db
				.select({ maxNumber: max(taskTable.number) })
				.from(taskTable)
				.where(eq(taskTable.projectId, recurring.projectId));

			const nextNumber = (maxNumberResult?.maxNumber ?? 0) + 1;

			await db.insert(taskTable).values({
				id: taskId,
				projectId: recurring.projectId,
				number: nextNumber,
				title: recurring.title,
				description: recurring.description,
				columnId: recurring.columnId,
				userId: recurring.assigneeId,
				priority: (recurring.priority ?? "no-priority") as
					| "no-priority"
					| "low"
					| "medium"
					| "high"
					| "urgent",
				position: 0,
			});

			const nextRun = computeNextRun(recurring);

			await db
				.update(recurringTaskTable)
				.set({
					lastRunAt: now,
					nextRunAt: nextRun,
				})
				.where(eq(recurringTaskTable.id, recurring.id));
		} catch (error) {
			console.error("Failed to process recurring task", {
				recurringTaskId: recurring.id,
				error,
			});
		}
	}
}
