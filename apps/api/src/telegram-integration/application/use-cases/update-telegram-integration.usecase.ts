import type {
	TelegramIntegrationResponse,
	UpdateTelegramIntegrationInput,
} from "../../domain";
import type { EventPublisher } from "../ports";
import type { TelegramIntegrationRepository } from "../ports/telegram-integration-repository.port";

export class UpdateTelegramIntegrationUseCase {
	constructor(
		private repository: TelegramIntegrationRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		userId: string,
		projectId: string,
		apiKeyId: string | undefined,
		input: UpdateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse> {
		const integration = await this.repository.update(projectId, input);

		await this.eventPublisher.publish("integration.updated", {
			projectId,
			userId,
			integrationType: "telegram",
			integrationId: integration.id,
			...(apiKeyId ? { apiKeyId } : {}),
		});

		return integration;
	}
}
