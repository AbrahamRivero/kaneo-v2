import { CreateActivityUseCase } from "../application/use-cases";
import { activityRepository } from "../infrastructure/repositories/drizzle-activity.repository";

const createActivity = new CreateActivityUseCase(activityRepository);

async function createActivityController(
	taskId: string,
	type: string,
	userId: string,
	content: string | null,
	eventData?: Record<string, unknown> | null,
) {
	return createActivity.execute({ taskId, type, userId, content, eventData });
}

export default createActivityController;
