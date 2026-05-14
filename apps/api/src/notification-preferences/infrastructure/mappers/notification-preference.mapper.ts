import type { NotificationPreferenceResponse } from "../../domain";

type WorkspaceRule = {
	id: string;
	workspaceId: string;
	workspaceName: string;
	isActive: boolean;
	emailEnabled: boolean;
	ntfyEnabled: boolean;
	gotifyEnabled: boolean;
	webhookEnabled: boolean;
	projectMode: string;
	selectedProjectIds: string[];
	createdAt: Date;
	updatedAt: Date;
};

type UserNotificationPreference = {
	userId: string;
	emailEnabled: boolean;
	ntfyEnabled: boolean;
	ntfyServerUrl: string | null;
	ntfyTopic: string | null;
	ntfyToken: string | null;
	gotifyEnabled: boolean;
	gotifyServerUrl: string | null;
	gotifyToken: string | null;
	webhookEnabled: boolean;
	webhookUrl: string | null;
	webhookSecret: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export function mapToNotificationPreferenceResponse(
	emailAddress: string | null,
	preference: UserNotificationPreference | null,
	rules: WorkspaceRule[],
): NotificationPreferenceResponse {
	const decrypted = preference
		? {
				...preference,
				ntfyToken: preference.ntfyToken,
				gotifyToken: preference.gotifyToken,
				webhookSecret: preference.webhookSecret,
			}
		: null;

	return {
		emailAddress,
		emailEnabled: decrypted?.emailEnabled ?? false,
		ntfyEnabled: decrypted?.ntfyEnabled ?? false,
		ntfyConfigured: Boolean(decrypted?.ntfyServerUrl && decrypted?.ntfyTopic),
		ntfyServerUrl: decrypted?.ntfyServerUrl ?? null,
		ntfyTopic: decrypted?.ntfyTopic ?? null,
		ntfyTokenConfigured: Boolean(decrypted?.ntfyToken),
		maskedNtfyToken: maskValue(decrypted?.ntfyToken),
		gotifyEnabled: decrypted?.gotifyEnabled ?? false,
		gotifyConfigured: Boolean(
			decrypted?.gotifyServerUrl && decrypted?.gotifyToken,
		),
		gotifyServerUrl: decrypted?.gotifyServerUrl ?? null,
		gotifyTokenConfigured: Boolean(decrypted?.gotifyToken),
		maskedGotifyToken: maskValue(decrypted?.gotifyToken),
		webhookEnabled: decrypted?.webhookEnabled ?? false,
		webhookConfigured: Boolean(decrypted?.webhookUrl),
		webhookUrl: decrypted?.webhookUrl ?? null,
		webhookSecretConfigured: Boolean(decrypted?.webhookSecret),
		maskedWebhookSecret: maskValue(decrypted?.webhookSecret),
		workspaces: rules.map((rule) => ({
			id: rule.id,
			workspaceId: rule.workspaceId,
			workspaceName: rule.workspaceName,
			isActive: rule.isActive ?? true,
			emailEnabled: rule.emailEnabled ?? false,
			ntfyEnabled: rule.ntfyEnabled ?? false,
			gotifyEnabled: rule.gotifyEnabled ?? false,
			webhookEnabled: rule.webhookEnabled ?? false,
			projectMode:
				rule.projectMode === "selected" ? "selected" : ("all" as const),
			selectedProjectIds: rule.selectedProjectIds,
			createdAt: rule.createdAt,
			updatedAt: rule.updatedAt,
		})),
		createdAt: preference?.createdAt ?? null,
		updatedAt: preference?.updatedAt ?? null,
	};
}

function maskValue(value: string | undefined | null): string | null {
	if (!value) return null;
	return value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : "••••";
}
