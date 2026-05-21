import type { Activity, CreateActivityInput } from "../../domain";

export interface ActivityRepository {
	findByTaskId(taskId: string): Promise<Activity[]>;
	create(input: CreateActivityInput): Promise<Activity | null>;
	updateContent(
		id: string,
		content: string,
		userId: string,
	): Promise<Activity | null>;
	deleteByIdAndUser(id: string, userId: string): Promise<Activity | null>;
}
