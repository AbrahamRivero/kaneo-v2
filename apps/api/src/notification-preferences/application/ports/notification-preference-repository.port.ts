import type {
	NotificationPreferenceResponse,
	UpdateNotificationPreferenceInput,
	UpsertWorkspaceRuleInput,
} from "../../domain";

export interface NotificationPreferenceRepository {
	getPreferences(
		userId: string,
		emailAddress: string | null,
	): Promise<NotificationPreferenceResponse>;
	updatePreferences(
		userId: string,
		emailAddress: string | null,
		input: UpdateNotificationPreferenceInput,
	): Promise<NotificationPreferenceResponse>;
	upsertWorkspaceRule(
		userId: string,
		workspaceId: string,
		emailAddress: string | null,
		input: UpsertWorkspaceRuleInput,
	): Promise<NotificationPreferenceResponse>;
	deleteWorkspaceRule(
		userId: string,
		workspaceId: string,
		emailAddress: string | null,
	): Promise<NotificationPreferenceResponse>;
}

export interface WorkspaceRepository {
	findMember(workspaceId: string, userId: string): Promise<boolean>;
}
