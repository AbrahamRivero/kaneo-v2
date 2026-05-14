import { HTTPException } from "hono/http-exception";
import type { TaskRepository } from "../../../task/application/ports";
import type { TaskRelation } from "../../domain";
import type { EventPublisher, TaskRelationRepository } from "../ports";

export class CreateTaskRelationUseCase {
	constructor(
		private taskRelationRepository: TaskRelationRepository,
		private taskRepository: TaskRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(input: {
		sourceTaskId: string;
		targetTaskId: string;
		relationType: string;
		userId: string;
	}): Promise<TaskRelation> {
		if (input.sourceTaskId === input.targetTaskId) {
			throw new HTTPException(400, {
				message: "Cannot create a relation between a task and itself",
			});
		}

		const sourceTask = await this.taskRepository.findById(input.sourceTaskId);

		if (!sourceTask) {
			throw new HTTPException(404, { message: "Source task not found" });
		}

		const targetTask = await this.taskRepository.findById(input.targetTaskId);

		if (!targetTask) {
			throw new HTTPException(404, { message: "Target task not found" });
		}

		const existing = await this.taskRelationRepository.findExistingRelation(
			input.sourceTaskId,
			input.targetTaskId,
			input.relationType,
		);

		if (existing) {
			throw new HTTPException(409, {
				message: "This relation already exists",
			});
		}

		const relation = await this.taskRelationRepository.create({
			sourceTaskId: input.sourceTaskId,
			targetTaskId: input.targetTaskId,
			relationType: input.relationType,
		});

		await this.eventPublisher.publish("task-relation.created", {
			...relation,
			taskId: input.sourceTaskId,
			projectId: sourceTask.projectId,
			userId: input.userId,
		});

		return relation;
	}
}
