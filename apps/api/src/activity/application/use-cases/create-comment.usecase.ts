import { HTTPException } from "hono/http-exception";
import type { UserRepository } from "../../../common/ports/user.port";
import type { TaskRepository } from "../../../task/application/ports";
import type { Activity, CreateCommentInput } from "../../domain";
import type { ActivityRepository, EventPublisher } from "../ports";

export class CreateCommentUseCase {
	constructor(
		private activityRepository: ActivityRepository,
		private taskRepository: TaskRepository,
		private userRepository: UserRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: CreateCommentInput): Promise<Activity> {
		const activity = await this.activityRepository.create({
			taskId: input.taskId,
			type: "comment",
			userId: input.userId,
			content: input.content,
		});

		if (!activity) {
			throw new HTTPException(500, {
				message: "Failed to create activity",
			});
		}

		const user = await this.userRepository.findById(input.userId);
		const task = await this.taskRepository.findById(input.taskId);

		if (task) {
			await this.eventPublisher.publish("task.comment_created", {
				...activity,
				comment: `**${user?.name}** commented:\n> ${input.content}`,
				projectId: task.projectId,
			});
		}

		return activity;
	}
}
