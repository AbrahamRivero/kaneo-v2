import { GetActivitiesUseCase } from "../application/use-cases";
import { activityRepository } from "../infrastructure/repositories/drizzle-activity.repository";

const getActivities = new GetActivitiesUseCase(activityRepository);

async function getActivitiesController(taskId: string) {
	return getActivities.execute(taskId);
}

export default getActivitiesController;
