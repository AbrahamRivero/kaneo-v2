import { UpdateNotificationPreferencesUseCase } from "../application/use-cases";
import type { UpdateNotificationPreferenceInput } from "../domain";
import { notificationPreferenceRepository } from "../infrastructure/repositories/drizzle-notification-preference.repository";

async function updateNotificationPreferencesController(
	userId: string,
	userEmail: string | null,
	input: UpdateNotificationPreferenceInput,
) {
	const useCase = new UpdateNotificationPreferencesUseCase(
		notificationPreferenceRepository,
	);
	return useCase.execute(userId, userEmail, input);
}

export default updateNotificationPreferencesController;
