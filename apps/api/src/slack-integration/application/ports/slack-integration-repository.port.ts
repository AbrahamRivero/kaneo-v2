import type {
	CreateSlackIntegrationInput,
	SlackIntegrationResponse,
	UpdateSlackIntegrationInput,
} from "../../domain";

export interface SlackIntegrationRepository {
	findByProjectId(projectId: string): Promise<SlackIntegrationResponse | null>;
	create(input: CreateSlackIntegrationInput): Promise<SlackIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateSlackIntegrationInput,
	): Promise<SlackIntegrationResponse>;
	delete(projectId: string): Promise<{ id: string }>;
}
