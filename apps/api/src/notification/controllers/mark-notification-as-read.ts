import { MarkNotificationAsReadUseCase } from "../application/use-cases";
import { notificationRepository } from "../infrastructure/repositories/drizzle-notification.repository";

const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(
	notificationRepository,
);

async function markNotificationAsRead(id: string, userId: string) {
	return markNotificationAsReadUseCase.execute(id, userId);
}

export default markNotificationAsRead;
