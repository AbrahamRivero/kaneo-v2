export type GenericWebhookIntegrationEvents = {
	taskCreated: boolean;
	taskStatusChanged: boolean;
	taskPriorityChanged: boolean;
	taskTitleChanged: boolean;
	taskDescriptionChanged: boolean;
	taskCommentCreated: boolean;
};

export type GenericWebhookIntegrationResponse = {
	id: string;
	projectId: string;
	webhookConfigured: boolean;
	maskedWebhookUrl: string | null;
	secretConfigured: boolean;
	maskedSecret: string | null;
	events: GenericWebhookIntegrationEvents;
	isActive: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateGenericWebhookIntegrationInput = {
	projectId: string;
	webhookUrl: string;
	secret?: string;
	events?: Partial<GenericWebhookIntegrationEvents>;
};

export type UpdateGenericWebhookIntegrationInput = {
	webhookUrl?: string;
	secret?: string | null;
	isActive?: boolean;
	events?: Partial<GenericWebhookIntegrationEvents>;
};
