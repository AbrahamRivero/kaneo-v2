import { publishEvent } from "../../events";
import { deleteOrphanedAssets } from "../../storage/cleanup-assets";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { DeleteCommentUseCase } from "../application/use-cases";
import { activityRepository } from "../infrastructure/repositories/drizzle-activity.repository";

const deleteComment = new DeleteCommentUseCase(
	activityRepository,
	new DrizzleTaskRepository(),
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function deleteCommentController(userId: string, id: string) {
	const deleted = await deleteComment.execute({ userId, id });

	deleteOrphanedAssets(deleted.content, null, {
		taskId: deleted.taskId,
	}).catch(() => {});

	return deleted;
}

export default deleteCommentController;
