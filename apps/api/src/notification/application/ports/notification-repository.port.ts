import type { CreateNotificationInput } from "../../domain";

type NotificationRecord = {
	id: string;
	userId: string;
	title: string | null;
	content: string | null;
	type: string;
	isRead: boolean | null;
	eventData: unknown;
	resourceId: string | null;
	resourceType: string | null;
	createdAt: Date;
};

export interface NotificationRepository {
	create(input: CreateNotificationInput): Promise<NotificationRecord>;
	getByUserId(userId: string): Promise<NotificationRecord[]>;
	markAsRead(id: string, userId: string): Promise<NotificationRecord>;
	markAllAsRead(userId: string): Promise<void>;
	clearAll(userId: string): Promise<void>;
}
