import type { EventPublisher } from "../ports";
import type { TelegramIntegrationRepository } from "../ports/telegram-integration-repository.port";

export class DeleteTelegramIntegrationUseCase {
	constructor(
		private repository: TelegramIntegrationRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		userId: string,
		projectId: string,
		apiKeyId: string | undefined,
	): Promise<void> {
		const integration = await this.repository.delete(projectId);

		await this.eventPublisher.publish("integration.deleted", {
			projectId,
			userId,
			integrationType: "telegram",
			integrationId: integration.id,
			...(apiKeyId ? { apiKeyId } : {}),
		});
	}
}
