import { HTTPException } from "hono/http-exception";
import { createTaskUseCases } from "../application";

const { getTask: getTaskUseCase } = createTaskUseCases();

async function getTask(taskId: string) {
	if (!taskId || taskId.length === 0) {
		throw new HTTPException(400, { message: "Task ID is required" });
	}
	try {
		return await getTaskUseCase.execute(taskId);
	} catch (error) {
		if (error instanceof Error && error.message === "Task not found") {
			throw new HTTPException(404, { message: "Task not found" });
		}
		throw error;
	}
}

export default getTask;
