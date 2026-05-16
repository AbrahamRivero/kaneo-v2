import { publishEvent } from "../../events";
import { CreateNotificationUseCase } from "../application/use-cases";
import { deliverNotification } from "../infrastructure/delivery/delivery";
import { notificationRepository } from "../infrastructure/repositories/drizzle-notification.repository";

const createNotificationUseCase = new CreateNotificationUseCase(
	notificationRepository,
);

async function createNotification({
	userId,
	title,
	content,
	type,
	eventData,
	resourceId,
	resourceType,
}: {
	userId: string;
	title?: string | null;
	content?: string | null;
	type?: string;
	eventData?: Record<string, unknown> | null;
	resourceId?: string;
	resourceType?: string;
}) {
	const notification = await createNotificationUseCase.execute({
		userId,
		title,
		content,
		type,
		eventData,
		resourceId,
		resourceType,
	});

	if (notification) {
		await publishEvent("notification.created", {
			notificationId: notification.id,
			userId,
		});

		void deliverNotification(notification.id).catch((error) => {
			console.error("Failed to deliver notification", {
				notificationId: notification.id,
				error,
			});
		});
	}

	return notification;
}

export default createNotification;
