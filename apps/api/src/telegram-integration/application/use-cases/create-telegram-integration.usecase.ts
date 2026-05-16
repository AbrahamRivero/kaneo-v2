import type {
	CreateTelegramIntegrationInput,
	TelegramIntegrationResponse,
} from "../../domain";
import type { EventPublisher } from "../ports";
import type { TelegramIntegrationRepository } from "../ports/telegram-integration-repository.port";

export class CreateTelegramIntegrationUseCase {
	constructor(
		private repository: TelegramIntegrationRepository,
		private eventPublisher: EventPublisher,
	) {}

	async execute(
		userId: string,
		apiKeyId: string | undefined,
		input: CreateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse> {
		const existing = await this.repository.findByProjectId(input.projectId);

		const integration = await this.repository.create(input);

		await this.eventPublisher.publish(
			existing ? "integration.updated" : "integration.created",
			{
				projectId: input.projectId,
				userId,
				integrationType: "telegram",
				integrationId: integration.id,
				...(apiKeyId ? { apiKeyId } : {}),
			},
		);

		return integration;
	}
}
