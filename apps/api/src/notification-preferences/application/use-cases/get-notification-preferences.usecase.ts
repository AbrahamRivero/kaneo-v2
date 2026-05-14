import type { NotificationPreferenceResponse } from "../../domain";
import type { NotificationPreferenceRepository } from "../ports";

export class GetNotificationPreferencesUseCase {
	constructor(private repository: NotificationPreferenceRepository) {}

	async execute(
		userId: string,
		emailAddress: string | null,
	): Promise<NotificationPreferenceResponse> {
		return this.repository.getPreferences(userId, emailAddress);
	}
}
