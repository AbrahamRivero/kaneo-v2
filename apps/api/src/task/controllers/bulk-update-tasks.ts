import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTable, taskTable } from "../../database/schema";
import { workspaceRepository } from "../../workspace/infrastructure/repositories/drizzle-workspace.repository";
import { createTaskUseCases } from "../application";
import type { BulkOperationInput } from "../domain";

const { bulkUpdateTasks: bulkUpdateTasksUseCase } = createTaskUseCases();

async function bulkUpdateTasks({
	taskIds,
	operation,
	value,
	userId,
}: {
	taskIds: string[];
	operation: BulkOperationInput["operation"];
	value?: string | null;
	userId: string;
}) {
	const tasks = await db
		.select({
			id: taskTable.id,
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

	return bulkUpdateTasksUseCase.execute({
		taskIds,
		operation,
		value,
		currentUserId: userId,
	});
}

export default bulkUpdateTasks;
