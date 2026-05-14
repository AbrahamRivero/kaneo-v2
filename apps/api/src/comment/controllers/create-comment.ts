import { publishEvent } from "../../events";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { CreateCommentUseCase } from "../application/use-cases";
import { commentRepository } from "../infrastructure/repositories/drizzle-comment.repository";

const taskRepository = new DrizzleTaskRepository();

const createComment = new CreateCommentUseCase(
	commentRepository,
	taskRepository,
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function createCommentController(
	taskId: string,
	userId: string,
	content: string,
) {
	return createComment.execute({ taskId, userId, content });
}

export default createCommentController;
