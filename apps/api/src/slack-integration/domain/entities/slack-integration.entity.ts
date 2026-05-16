export type SlackIntegrationEvents = {
	taskCreated: boolean;
	taskStatusChanged: boolean;
	taskPriorityChanged: boolean;
	taskTitleChanged: boolean;
	taskDescriptionChanged: boolean;
	taskCommentCreated: boolean;
};

export type SlackIntegrationResponse = {
	id: string;
	projectId: string;
	channelName: string | null;
	webhookConfigured: boolean;
	maskedWebhookUrl: string;
	events: SlackIntegrationEvents;
	isActive: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateSlackIntegrationInput = {
	projectId: string;
	webhookUrl: string;
	channelName?: string;
	events?: Partial<SlackIntegrationEvents>;
};

export type UpdateSlackIntegrationInput = {
	webhookUrl?: string;
	channelName?: string | null;
	isActive?: boolean;
	events?: Partial<SlackIntegrationEvents>;
};
