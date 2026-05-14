import type {
	NotificationPreferenceResponse,
	UpdateNotificationPreferenceInput,
} from "../../domain";
import type { NotificationPreferenceRepository } from "../ports";

export class UpdateNotificationPreferencesUseCase {
	constructor(private repository: NotificationPreferenceRepository) {}

	async execute(
		userId: string,
		emailAddress: string | null,
		input: UpdateNotificationPreferenceInput,
	): Promise<NotificationPreferenceResponse> {
		return this.repository.updatePreferences(userId, emailAddress, input);
	}
}
