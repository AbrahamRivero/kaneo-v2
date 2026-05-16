import type {
	CreateGenericWebhookIntegrationInput,
	GenericWebhookIntegrationResponse,
} from "../../domain";
import type { GenericWebhookIntegrationRepository } from "../ports/generic-webhook-integration-repository.port";

export class CreateGenericWebhookIntegrationUseCase {
	constructor(private repository: GenericWebhookIntegrationRepository) {}

	async execute(
		input: CreateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse> {
		return this.repository.create(input);
	}
}
