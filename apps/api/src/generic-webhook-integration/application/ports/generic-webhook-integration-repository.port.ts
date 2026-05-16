import type {
	CreateGenericWebhookIntegrationInput,
	GenericWebhookIntegrationResponse,
	UpdateGenericWebhookIntegrationInput,
} from "../../domain";

export interface GenericWebhookIntegrationRepository {
	findByProjectId(
		projectId: string,
	): Promise<GenericWebhookIntegrationResponse | null>;
	create(
		input: CreateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse>;
	delete(projectId: string): Promise<{ id: string }>;
}
