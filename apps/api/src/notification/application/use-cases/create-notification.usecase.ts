import type { CreateNotificationInput } from "../../domain";
import type { NotificationRepository } from "../ports/notification-repository.port";

export class CreateNotificationUseCase {
	constructor(private repository: NotificationRepository) {}

	async execute(input: CreateNotificationInput) {
		return this.repository.create(input);
	}
}
