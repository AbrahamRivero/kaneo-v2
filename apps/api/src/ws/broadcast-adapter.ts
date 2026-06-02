export type ProjectBroadcastMessage = {
	type: string;
	projectId: string;
	taskId?: string;
	sourceTaskId?: string;
	targetTaskId?: string;
	notification?: {
		id: string;
		userId: string;
		title: string | null;
		content: string | null;
		type: string;
		eventData: unknown;
		resourceId: string | null;
		resourceType: string | null;
		isRead: boolean | null;
		createdAt: Date;
	};
};

export type BroadcastMessage = {
	projectId: string;
	message: ProjectBroadcastMessage;
	excludeInitiatorId?: string;
};

export type BroadcastAdapter = {
	/** Publish a message to all instances watching this project */
	publish(msg: BroadcastMessage): Promise<void>;

	/** Subscribe to messages for delivery to local connections */
	subscribe(handler: (msg: BroadcastMessage) => void): Promise<void>;

	/** Cleanup on shutdown */
	shutdown(): Promise<void>;
};
