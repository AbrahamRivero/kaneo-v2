import type { NotificationRepository } from "../ports/notification-repository.port";

export class MarkAllNotificationsAsReadUseCase {
	constructor(private repository: NotificationRepository) {}

	async execute(userId: string) {
		await this.repository.markAllAsRead(userId);
		return { success: true };
	}
}
