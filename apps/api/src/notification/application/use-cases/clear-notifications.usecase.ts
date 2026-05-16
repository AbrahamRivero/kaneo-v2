import type { NotificationRepository } from "../ports/notification-repository.port";

export class ClearNotificationsUseCase {
	constructor(private repository: NotificationRepository) {}

	async execute(userId: string) {
		await this.repository.clearAll(userId);
		return { success: true };
	}
}
