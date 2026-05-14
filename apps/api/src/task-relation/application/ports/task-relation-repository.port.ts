import type { TaskRelation, TaskRelationWithTasks } from "../../domain";

export interface CreateTaskRelationInput {
	sourceTaskId: string;
	targetTaskId: string;
	relationType: string;
}

export interface TaskRelationRepository {
	findByTaskId(taskId: string): Promise<TaskRelationWithTasks[]>;
	findById(id: string): Promise<TaskRelation | null>;
	findExistingRelation(
		sourceTaskId: string,
		targetTaskId: string,
		relationType: string,
	): Promise<TaskRelation | null>;
	create(input: CreateTaskRelationInput): Promise<TaskRelation | null>;
	delete(id: string): Promise<TaskRelation | null>;
}
