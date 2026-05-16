export type DiscordIntegrationEvents = {
	taskCreated: boolean;
	taskStatusChanged: boolean;
	taskPriorityChanged: boolean;
	taskTitleChanged: boolean;
	taskDescriptionChanged: boolean;
	taskCommentCreated: boolean;
};

export type DiscordIntegrationResponse = {
	id: string;
	projectId: string;
	channelName: string | null;
	webhookConfigured: boolean;
	maskedWebhookUrl: string;
	events: DiscordIntegrationEvents;
	isActive: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateDiscordIntegrationInput = {
	projectId: string;
	webhookUrl: string;
	channelName?: string;
	events?: Partial<DiscordIntegrationEvents>;
};

export type UpdateDiscordIntegrationInput = {
	webhookUrl?: string;
	channelName?: string | null;
	isActive?: boolean;
	events?: Partial<DiscordIntegrationEvents>;
};
