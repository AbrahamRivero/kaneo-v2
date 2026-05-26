import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, lte, max } from "drizzle-orm";
import db from "../database";
import {
	labelTable,
	projectTable,
	recurringTaskChecklistItemTable,
	recurringTaskTable,
	taskChecklistItemTable,
	taskTable,
} from "../database/schema";
import { publishEvent } from "../events";

function computeNextRun(task: typeof recurringTaskTable.$inferSelect): Date {
	const now = new Date();
	const next = new Date(task.nextRunAt);
	const interval = task.intervalValue ?? 1;

	while (next <= now) {
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
	}

	return next;
}

export async function processRecurringTasks(): Promise<void> {
	const now = new Date();

	const dueTasks = await db.transaction(async (tx) => {
		return await tx
			.select()
			.from(recurringTaskTable)
			.where(
				and(
					eq(recurringTaskTable.isActive, true),
					lte(recurringTaskTable.nextRunAt, now),
				),
			)
			.for("update", { skipLocked: true });
	});

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

			const taskValues: Record<string, unknown> = {
				id: taskId,
				projectId: recurring.projectId,
				number: nextNumber,
				title: recurring.title,
				description: recurring.description,
				columnId: recurring.columnId,
				userId: recurring.assigneeId,
				createdBy: recurring.createdBy,
				recurringTaskId: recurring.id,
				priority: (recurring.priority ?? "no-priority") as
					| "no-priority"
					| "low"
					| "medium"
					| "high"
					| "urgent",
				position: 0,
			};

			if (recurring.dueDateDaysOffset != null) {
				taskValues.dueDate = new Date(
					now.getTime() + recurring.dueDateDaysOffset * 24 * 60 * 60 * 1000,
				);
			}

			await db
				.insert(taskTable)
				.values(taskValues as typeof taskTable.$inferInsert);

			if (
				recurring.labelIds != null &&
				Array.isArray(recurring.labelIds) &&
				(recurring.labelIds as string[]).length > 0
			) {
				const sourceLabels = await db
					.select()
					.from(labelTable)
					.where(inArray(labelTable.id, recurring.labelIds as string[]));

				if (sourceLabels.length > 0) {
					await db.insert(labelTable).values(
						sourceLabels.map((label) => ({
							id: createId(),
							name: label.name,
							color: label.color,
							taskId: taskId,
							workspaceId: label.workspaceId,
						})),
					);
				}
			}

			const templateChecklistItems = await db
				.select()
				.from(recurringTaskChecklistItemTable)
				.where(
					eq(recurringTaskChecklistItemTable.recurringTaskId, recurring.id),
				)
				.orderBy(recurringTaskChecklistItemTable.position);

			if (templateChecklistItems.length > 0) {
				await db.insert(taskChecklistItemTable).values(
					templateChecklistItems.map((item) => ({
						id: createId(),
						taskId,
						text: item.text,
						position: item.position,
					})),
				);
			}

			await publishEvent("task.created", {
				taskId,
				projectId: recurring.projectId,
				userId: recurring.createdBy ?? "",
				assigneeId: recurring.assigneeId,
				currentUserId: recurring.createdBy,
				type: "created",
				content: null,
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
