import type { TelegramIntegrationResponse } from "../../domain";
import type { TelegramIntegrationRepository } from "../ports/telegram-integration-repository.port";

export class GetTelegramIntegrationUseCase {
	constructor(private repository: TelegramIntegrationRepository) {}

	async execute(
		projectId: string,
	): Promise<TelegramIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
