import type { Activity, CreateActivityInput } from "../../domain";
import type { ActivityRepository } from "../ports";

export class CreateActivityUseCase {
	constructor(private activityRepository: ActivityRepository) {}

	async execute(input: CreateActivityInput): Promise<Activity | null> {
		return this.activityRepository.create(input);
	}
}
