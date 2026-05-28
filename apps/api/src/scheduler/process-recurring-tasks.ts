import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, lte, max } from "drizzle-orm";
import db from "../database";
import {
	labelTable,
	projectTable,
	recurringTaskChecklistItemTable,
	recurringTaskTable,
	taskRelationTable,
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

			// Atomic creation: task + labels + subtasks in one transaction
			const { taskId, number } = await db.transaction(async (tx) => {
				const taskId = createId();

				const [maxNumberResult] = await tx
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
						recurring.nextRunAt.getTime() +
							recurring.dueDateDaysOffset * 24 * 60 * 60 * 1000,
					);
				}

				await tx
					.insert(taskTable)
					.values(taskValues as typeof taskTable.$inferInsert);

				if (
					recurring.labelIds != null &&
					Array.isArray(recurring.labelIds) &&
					(recurring.labelIds as string[]).length > 0
				) {
					const sourceLabels = await tx
						.select()
						.from(labelTable)
						.where(inArray(labelTable.id, recurring.labelIds as string[]));

					if (sourceLabels.length > 0) {
						await tx.insert(labelTable).values(
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

				// Convert checklist items into real subtasks with relations
				const templateChecklistItems = await tx
					.select()
					.from(recurringTaskChecklistItemTable)
					.where(
						eq(recurringTaskChecklistItemTable.recurringTaskId, recurring.id),
					)
					.orderBy(recurringTaskChecklistItemTable.position);

				if (templateChecklistItems.length > 0) {
					const subTaskNumber = nextNumber + 1;
					const subTaskIds = templateChecklistItems.map(() => createId());

					await tx.insert(taskTable).values(
						templateChecklistItems.map((item, i) => ({
							id: subTaskIds[i],
							projectId: recurring.projectId,
							number: subTaskNumber + i,
							title: item.text,
							columnId: recurring.columnId,
							createdBy: recurring.createdBy,
							priority: "no-priority",
							position: item.position,
							status: "to-do",
						})),
					);

					await tx.insert(taskRelationTable).values(
						subTaskIds.map((subTaskId) => ({
							id: createId(),
							sourceTaskId: taskId,
							targetTaskId: subTaskId,
							relationType: "subtask",
						})),
					);
				}

				return { taskId, number: nextNumber };
			});

			await publishEvent("task.created", {
				taskId,
				projectId: recurring.projectId,
				title: recurring.title,
				description: recurring.description,
				priority: recurring.priority ?? "no-priority",
				status: "to-do",
				number,
				userId: recurring.createdBy ?? "",
				assigneeId: recurring.assigneeId,
				currentUserId: recurring.createdBy ?? "",
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
