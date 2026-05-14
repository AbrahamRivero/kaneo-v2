import type { Activity } from "../../domain";
import type { ActivityRepository } from "../ports";

export class GetActivitiesUseCase {
	constructor(private activityRepository: ActivityRepository) {}

	async execute(taskId: string): Promise<Activity[]> {
		const activities = await this.activityRepository.findByTaskId(taskId);

		for (const activity of activities) {
			if (activity.content) {
				activity.content = activity.content.replace(/\n+/g, "\n");
			}
		}

		return activities;
	}
}
