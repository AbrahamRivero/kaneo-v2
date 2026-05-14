export type NotificationPreferenceProjectMode = "all" | "selected";

export type NotificationPreferenceResponse = {
	emailAddress: string | null;
	emailEnabled: boolean;
	ntfyEnabled: boolean;
	ntfyConfigured: boolean;
	ntfyServerUrl: string | null;
	ntfyTopic: string | null;
	ntfyTokenConfigured: boolean;
	maskedNtfyToken: string | null;
	gotifyEnabled: boolean;
	gotifyConfigured: boolean;
	gotifyServerUrl: string | null;
	gotifyTokenConfigured: boolean;
	maskedGotifyToken: string | null;
	webhookEnabled: boolean;
	webhookConfigured: boolean;
	webhookUrl: string | null;
	webhookSecretConfigured: boolean;
	maskedWebhookSecret: string | null;
	workspaces: Array<{
		id: string;
		workspaceId: string;
		workspaceName: string;
		isActive: boolean;
		emailEnabled: boolean;
		ntfyEnabled: boolean;
		gotifyEnabled: boolean;
		webhookEnabled: boolean;
		projectMode: NotificationPreferenceProjectMode;
		selectedProjectIds: string[];
		createdAt: Date;
		updatedAt: Date;
	}>;
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type UpdateNotificationPreferenceInput = {
	emailEnabled?: boolean;
	ntfyEnabled?: boolean;
	ntfyServerUrl?: string | null;
	ntfyTopic?: string | null;
	ntfyToken?: string | null;
	gotifyEnabled?: boolean;
	gotifyServerUrl?: string | null;
	gotifyToken?: string | null;
	webhookEnabled?: boolean;
	webhookUrl?: string | null;
	webhookSecret?: string | null;
};

export type UpsertWorkspaceRuleInput = {
	isActive: boolean;
	emailEnabled: boolean;
	ntfyEnabled: boolean;
	gotifyEnabled: boolean;
	webhookEnabled: boolean;
	projectMode: NotificationPreferenceProjectMode;
	selectedProjectIds?: string[];
};

export type WorkspaceRuleChannelState = {
	emailEnabled: boolean;
	ntfyEnabled: boolean;
	gotifyEnabled: boolean;
	webhookEnabled: boolean;
};
