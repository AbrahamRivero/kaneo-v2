import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Task } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class UpdateTaskAssigneeUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		taskId: string,
		userId: string,
		currentUserId: string,
	): Promise<Task> {
		const oldTask = await this.taskRepository.findById(taskId);
		if (!oldTask) throw new Error("Task not found");

		const task = await this.taskRepository.updateAssignee(
			taskId,
			userId,
			currentUserId,
		);

		const updatedTask = await this.taskRepository.findById(taskId);

		await this.eventPublisher.publish("task.assignee_changed", {
			taskId: task.id,
			projectId: task.projectId,
			userId: currentUserId,
			oldAssignee: oldTask.assigneeName,
			newAssignee: updatedTask?.assigneeName ?? null,
			newAssigneeId: updatedTask?.assigneeId ?? null,
			title: task.title,
			type: "assignee_changed",
		});

		if (!userId) {
			await this.eventPublisher.publish("task.unassigned", {
				taskId: task.id,
				projectId: task.projectId,
				userId: currentUserId,
				title: task.title,
				type: "unassigned",
			});
		}

		await this.eventPublisher.publish("task-relation.refresh", {
			projectId: task.projectId,
			userId: currentUserId,
		});

		return task;
	}
}
