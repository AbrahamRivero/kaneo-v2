import { HTTPException } from "hono/http-exception";
import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { MoveTaskInput, MoveTaskResult } from "../../domain";
import type { TaskRepository } from "../ports/task-repository.port";

export class MoveTaskUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: MoveTaskInput): Promise<MoveTaskResult> {
		const existingTask = await this.taskRepository.findById(input.taskId);

		if (!existingTask) {
			throw new HTTPException(404, {
				message: "Task not found",
			});
		}

		if (existingTask.projectId === input.destinationProjectId) {
			throw new HTTPException(400, {
				message: "Task is already in that project",
			});
		}

		const [sourceWorkspaceId, destinationWorkspaceId] = await Promise.all([
			this.taskRepository.getProjectWorkspaceId(existingTask.projectId),
			this.taskRepository.getProjectWorkspaceId(input.destinationProjectId),
		]);

		if (!sourceWorkspaceId || !destinationWorkspaceId) {
			throw new HTTPException(404, {
				message: "Project not found",
			});
		}

		if (sourceWorkspaceId !== destinationWorkspaceId) {
			throw new HTTPException(400, {
				message: "Tasks can only be moved within the same workspace",
			});
		}

		const result = await this.taskRepository.move(input);

		const [sourceProject, destinationProject] = await Promise.all([
			this.taskRepository.getProject(existingTask.projectId),
			this.taskRepository.getProject(input.destinationProjectId),
		]);

		await this.eventPublisher.publish("task.moved", {
			taskId: result.task.id,
			userId: input.currentUserId,
			fromProjectId: existingTask.projectId,
			fromProjectName: sourceProject?.name ?? "Unknown",
			toProjectId: result.task.projectId,
			toProjectName: destinationProject?.name ?? "Unknown",
			oldStatus: existingTask.status,
			newStatus: result.task.status,
			type: "moved",
			content: null,
		});

		return result;
	}
}
