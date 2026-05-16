export type TelegramIntegrationEvents = {
	taskCreated: boolean;
	taskStatusChanged: boolean;
	taskPriorityChanged: boolean;
	taskTitleChanged: boolean;
	taskDescriptionChanged: boolean;
	taskCommentCreated: boolean;
};

export type TelegramIntegrationResponse = {
	id: string;
	projectId: string;
	chatId: string;
	threadId: number | null;
	chatLabel: string | null;
	botTokenConfigured: boolean;
	maskedBotToken: string;
	events: TelegramIntegrationEvents;
	isActive: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateTelegramIntegrationInput = {
	projectId: string;
	botToken: string;
	chatId: string;
	threadId?: number;
	chatLabel?: string;
	events?: Partial<TelegramIntegrationEvents>;
};

export type UpdateTelegramIntegrationInput = {
	botToken?: string;
	chatId?: string;
	threadId?: number | null;
	chatLabel?: string | null;
	isActive?: boolean;
	events?: Partial<TelegramIntegrationEvents>;
};
