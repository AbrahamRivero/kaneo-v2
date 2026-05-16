import type { NotificationRepository } from "../ports/notification-repository.port";

export class MarkNotificationAsReadUseCase {
	constructor(private repository: NotificationRepository) {}

	async execute(id: string, userId: string) {
		return this.repository.markAsRead(id, userId);
	}
}
