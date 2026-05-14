import { GetNotificationPreferencesUseCase } from "../application/use-cases";
import { notificationPreferenceRepository } from "../infrastructure/repositories/drizzle-notification-preference.repository";

async function getNotificationPreferencesController(
	userId: string,
	userEmail: string | null,
) {
	const useCase = new GetNotificationPreferencesUseCase(
		notificationPreferenceRepository,
	);
	return useCase.execute(userId, userEmail);
}

export default getNotificationPreferencesController;
