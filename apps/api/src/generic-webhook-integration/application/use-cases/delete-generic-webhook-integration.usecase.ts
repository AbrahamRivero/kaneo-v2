import type { GenericWebhookIntegrationRepository } from "../ports/generic-webhook-integration-repository.port";

export class DeleteGenericWebhookIntegrationUseCase {
	constructor(private repository: GenericWebhookIntegrationRepository) {}

	async execute(projectId: string): Promise<void> {
		await this.repository.delete(projectId);
	}
}
