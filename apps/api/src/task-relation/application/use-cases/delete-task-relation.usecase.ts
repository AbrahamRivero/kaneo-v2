import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import { validateWorkspaceAccess } from "../../../utils/validate-workspace-access";
import type { TaskRelation } from "../../domain";
import type { EventPublisher, TaskRelationRepository } from "../ports";

export class DeleteTaskRelationUseCase {
	constructor(
		private taskRelationRepository: TaskRelationRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: { id: string; userId: string }): Promise<TaskRelation> {
		const rel = await this.taskRelationRepository.findById(input.id);

		if (!rel) {
			throw new HTTPException(404, {
				message: "Task relation not found",
			});
		}

		const task = await this.taskRepository.findById(rel.sourceTaskId);

		if (task) {
			const workspaceId = await this.taskRepository.getProjectWorkspaceId(
				task.projectId,
			);

			if (workspaceId) {
				await validateWorkspaceAccess(input.userId, workspaceId);
			}
		}

		const deleted = await this.taskRelationRepository.delete(input.id);

		if (!deleted) {
			throw new HTTPException(404, {
				message: "Task relation not found",
			});
		}

		if (task) {
			await this.eventPublisher.publish("task-relation.deleted", {
				...deleted,
				taskId: rel.sourceTaskId,
				sourceTaskId: rel.sourceTaskId,
				targetTaskId: rel.targetTaskId,
				projectId: task.projectId,
				userId: input.userId,
			});
		}

		return deleted;
	}
}
