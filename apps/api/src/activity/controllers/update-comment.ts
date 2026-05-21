import { and, eq } from "drizzle-orm";
import db from "../../database";
import { activityTable } from "../../database/schema";
import { publishEvent } from "../../events";
import { deleteOrphanedAssets } from "../../storage/cleanup-assets";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { UpdateCommentUseCase } from "../application/use-cases";
import { activityRepository } from "../infrastructure/repositories/drizzle-activity.repository";

const updateComment = new UpdateCommentUseCase(
	activityRepository,
	new DrizzleTaskRepository(),
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function updateCommentController(
	userId: string,
	id: string,
	content: string,
) {
	const [existing] = await db
		.select({
			content: activityTable.content,
			taskId: activityTable.taskId,
		})
		.from(activityTable)
		.where(and(eq(activityTable.id, id), eq(activityTable.userId, userId)))
		.limit(1);

	const updated = await updateComment.execute({ userId, id, content });

	if (existing) {
		deleteOrphanedAssets(existing.content, content, {
			taskId: existing.taskId,
		}).catch(() => {});
	}

	return updated;
}

export default updateCommentController;
