import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { labelTable, projectTable, taskTable } from "../../database/schema";
import { publishEvent } from "../../events";
import { workspaceRepository } from "../../workspace/infrastructure/repositories/drizzle-workspace.repository";
import { createTaskUseCases } from "../application";

const { bulkUpdateTasks: bulkUpdateTasksUseCase } = createTaskUseCases();

type BulkOperation =
	| "updateStatus"
	| "updatePriority"
	| "updateAssignee"
	| "delete"
	| "addLabel"
	| "removeLabel"
	| "updateDueDate";

async function bulkUpdateTasks({
	taskIds,
	operation,
	value,
	userId,
}: {
	taskIds: string[];
	operation: BulkOperation;
	value?: string | null;
	userId: string;
}) {
	const tasks = await db
		.select({
			id: taskTable.id,
			projectId: taskTable.projectId,
			workspaceId: projectTable.workspaceId,
		})
		.from(taskTable)
		.innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
		.where(inArray(taskTable.id, taskIds));

	if (tasks.length === 0) {
		throw new HTTPException(404, {
			message: "No tasks found",
		});
	}

	const workspaceIds = [...new Set(tasks.map((t) => t.workspaceId))];

	if (workspaceIds.length > 1) {
		throw new HTTPException(400, {
			message: "All tasks must belong to the same workspace",
		});
	}

	const workspaceId = workspaceIds[0];

	if (!workspaceId) {
		throw new HTTPException(400, {
			message: "Could not determine workspace",
		});
	}

	const membership = await workspaceRepository.findMember(workspaceId, userId);

	if (!membership) {
		throw new HTTPException(403, {
			message: "You don't have access to this workspace",
		});
	}

	const supportedOperations: BulkOperation[] = [
		"updateStatus",
		"updatePriority",
		"updateAssignee",
		"delete",
		"updateDueDate",
	];

	if (supportedOperations.includes(operation)) {
		return bulkUpdateTasksUseCase.execute({
			taskIds,
			operation,
			value,
			currentUserId: userId,
		});
	}

	const foundIds = tasks.map((t) => t.id);
	let updatedCount = 0;

	switch (operation) {
		case "addLabel": {
			if (!value) {
				throw new HTTPException(400, { message: "Label ID is required" });
			}

			const label = await db.query.labelTable.findFirst({
				where: eq(labelTable.id, value),
			});

			if (!label) {
				throw new HTTPException(404, { message: "Label not found" });
			}

			for (const task of tasks) {
				const existingAssignment = await db.query.labelTable.findFirst({
					where: and(
						eq(labelTable.name, label.name),
						eq(labelTable.taskId, task.id),
					),
				});

				if (!existingAssignment) {
					await db
						.insert(labelTable)
						.values({
							name: label.name,
							color: label.color,
							workspaceId: workspaceId,
							taskId: task.id,
						})
						.onConflictDoNothing({
							target: [labelTable.taskId, labelTable.name],
						});
					updatedCount++;

					await publishEvent("task.label_assigned", {
						projectId: task.projectId,
						taskId: task.id,
						userId,
						type: "label_assigned",
					});
				}
			}
			break;
		}

		case "removeLabel": {
			if (!value) {
				throw new HTTPException(400, { message: "Label ID is required" });
			}
			const result = await db
				.update(labelTable)
				.set({ taskId: null })
				.where(
					and(eq(labelTable.id, value), inArray(labelTable.taskId, foundIds)),
				);

			updatedCount = result.rowCount ?? foundIds.length;

			for (const task of tasks) {
				await publishEvent("task.label_unassigned", {
					projectId: task.projectId,
					taskId: task.id,
					userId,
					type: "label_unassigned",
				});
			}
			break;
		}

		default: {
			throw new HTTPException(400, {
				message: `Unknown operation "${operation}"`,
			});
		}
	}

	return { success: true, updatedCount };
}

export default bulkUpdateTasks;
