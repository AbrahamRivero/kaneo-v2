import type {
	CreateTelegramIntegrationInput,
	TelegramIntegrationResponse,
	UpdateTelegramIntegrationInput,
} from "../../domain";

export interface TelegramIntegrationRepository {
	findByProjectId(
		projectId: string,
	): Promise<TelegramIntegrationResponse | null>;
	create(
		input: CreateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse>;
	delete(projectId: string): Promise<{ id: string }>;
}
