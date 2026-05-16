import type {
	CreateDiscordIntegrationInput,
	DiscordIntegrationResponse,
	UpdateDiscordIntegrationInput,
} from "../../domain";

export interface DiscordIntegrationRepository {
	findByProjectId(
		projectId: string,
	): Promise<DiscordIntegrationResponse | null>;
	create(
		input: CreateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse>;
	delete(projectId: string): Promise<{ id: string }>;
}
