export type NotificationType =
	| "info"
	| "task_created"
	| "workspace_created"
	| "task_status_changed"
	| "task_assignee_changed"
	| "time_entry_created"
	| "due_date_reminder"
	| "task_overdue"
	| "task_comment_created"
	| "task_updated"
	| "project_created";

export type CreateNotificationInput = {
	userId: string;
	title?: string | null;
	content?: string | null;
	type?: string;
	eventData?: Record<string, unknown> | null;
	resourceId?: string;
	resourceType?: string;
};
