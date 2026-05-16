import type { NotificationRepository } from "../ports/notification-repository.port";

export class GetNotificationsUseCase {
	constructor(private repository: NotificationRepository) {}

	async execute(userId: string) {
		return this.repository.getByUserId(userId);
	}
}
