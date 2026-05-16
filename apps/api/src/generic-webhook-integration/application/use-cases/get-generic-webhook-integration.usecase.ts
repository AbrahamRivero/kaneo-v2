import type { GenericWebhookIntegrationResponse } from "../../domain";
import type { GenericWebhookIntegrationRepository } from "../ports/generic-webhook-integration-repository.port";

export class GetGenericWebhookIntegrationUseCase {
	constructor(private repository: GenericWebhookIntegrationRepository) {}

	async execute(
		projectId: string,
	): Promise<GenericWebhookIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
