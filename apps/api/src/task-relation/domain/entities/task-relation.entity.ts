export interface TaskRelation {
	id: string;
	sourceTaskId: string;
	targetTaskId: string;
	relationType: string;
	createdAt: Date;
}

export interface TaskRelationTask {
	id: string;
	title: string;
	status: string;
	priority: string | null;
	number: number | null;
	projectId: string;
	userId: string | null;
	assigneeName: string | null;
}

export interface TaskRelationWithTasks extends TaskRelation {
	sourceTask: TaskRelationTask | null;
	targetTask: TaskRelationTask | null;
}

export type RelationType = "subtask" | "blocks" | "related";
