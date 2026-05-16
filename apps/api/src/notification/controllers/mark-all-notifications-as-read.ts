import { MarkAllNotificationsAsReadUseCase } from "../application/use-cases";
import { notificationRepository } from "../infrastructure/repositories/drizzle-notification.repository";

const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(
	notificationRepository,
);

async function markAllNotificationsAsRead(userId: string) {
	return markAllNotificationsAsReadUseCase.execute(userId);
}

export default markAllNotificationsAsRead;
