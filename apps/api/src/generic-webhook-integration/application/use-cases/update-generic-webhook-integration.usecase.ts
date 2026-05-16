import type {
	GenericWebhookIntegrationResponse,
	UpdateGenericWebhookIntegrationInput,
} from "../../domain";
import type { GenericWebhookIntegrationRepository } from "../ports/generic-webhook-integration-repository.port";

export class UpdateGenericWebhookIntegrationUseCase {
	constructor(private repository: GenericWebhookIntegrationRepository) {}

	async execute(
		projectId: string,
		input: UpdateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse> {
		return this.repository.update(projectId, input);
	}
}
