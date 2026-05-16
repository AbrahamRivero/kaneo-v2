import { GetNotificationsUseCase } from "../application/use-cases";
import { notificationRepository } from "../infrastructure/repositories/drizzle-notification.repository";

const getNotificationsUseCase = new GetNotificationsUseCase(
	notificationRepository,
);

async function getNotifications(userId: string) {
	return getNotificationsUseCase.execute(userId);
}

export default getNotifications;
