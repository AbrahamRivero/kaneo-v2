import { ClearNotificationsUseCase } from "../application/use-cases";
import { notificationRepository } from "../infrastructure/repositories/drizzle-notification.repository";

const clearNotificationsUseCase = new ClearNotificationsUseCase(
	notificationRepository,
);

async function clearNotifications(userId: string) {
	return clearNotificationsUseCase.execute(userId);
}

export default clearNotifications;
