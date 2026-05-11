export interface EventPublisher {
	publish(eventType: string, data: unknown): Promise<void>;
}

export interface TaskEventData {
	taskId: string;
	projectId: string;
	userId: string;
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
