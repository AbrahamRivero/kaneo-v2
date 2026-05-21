export interface EventPublisher {
	publish(eventType: string, data: unknown): Promise<void>;
}

export interface TaskEventData {
	taskId: string;
	projectId: string;
	userId: string;
	assigneeId?: string | null;
	type: string;
	content?: string | null;
}

export interface TaskDeletedEventData {
	taskId: string;
	projectId: string;
	userId: string;
}

export interface TaskRelationDeletedEventData {
	projectId: string;
	userId: string;
	taskId: string;
	sourceTaskId: string;
	targetTaskId: string;
}

export interface LabelEventData {
	label: {
		id: string;
		name: string;
		color: string;
		taskId: string | null;
		workspaceId: string;
	};
	task?: {
		id: string;
		projectId: string;
		workspaceId: string;
	};
	projectId: string;
	taskId: string;
	userId: string;
	type: string;
}
