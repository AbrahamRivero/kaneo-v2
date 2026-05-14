import { publishEvent } from "../../events";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { CreateCommentUseCase } from "../application/use-cases";
import { activityRepository } from "../infrastructure/repositories/drizzle-activity.repository";
import { DrizzleUserRepository } from "../infrastructure/repositories/drizzle-user.repository";

const createComment = new CreateCommentUseCase(
	activityRepository,
	new DrizzleTaskRepository(),
	new DrizzleUserRepository(),
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
