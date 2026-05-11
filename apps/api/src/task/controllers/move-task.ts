import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { projectTable, taskTable } from "../../database/schema";
import { createTaskUseCases } from "../application";

const { moveTask: moveTaskUseCase } = createTaskUseCases();

async function moveTask({
	taskId,
	destinationProjectId,
	destinationStatus,
	currentUserId,
}: {
	taskId: string;
	destinationProjectId: string;
	destinationStatus?: string;
	currentUserId: string;
}) {
	const existingTask = await db.query.taskTable.findFirst({
		where: eq(taskTable.id, taskId),
	});

	if (!existingTask) {
		throw new HTTPException(404, {
			message: "Task not found",
		});
	}

	if (existingTask.projectId === destinationProjectId) {
		throw new HTTPException(400, {
			message: "Task is already in that project",
		});
	}

	const [sourceProject, destinationProject] = await Promise.all([
		db.query.projectTable.findFirst({
			where: eq(projectTable.id, existingTask.projectId),
		}),
		db.query.projectTable.findFirst({
			where: eq(projectTable.id, destinationProjectId),
		}),
	]);

	if (!sourceProject || !destinationProject) {
		throw new HTTPException(404, {
			message: "Project not found",
		});
	}

	if (sourceProject.workspaceId !== destinationProject.workspaceId) {
		throw new HTTPException(400, {
			message: "Tasks can only be moved within the same workspace",
		});
	}

	return moveTaskUseCase.execute({
		taskId,
		destinationProjectId,
		destinationStatus,
		currentUserId,
	});
}

export default moveTask;
