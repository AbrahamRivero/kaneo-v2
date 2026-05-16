import type {
	CreateGiteaIntegrationInput,
	GiteaIntegrationResponse,
	UpdateGiteaIntegrationInput,
} from "../../domain";

export interface GiteaIntegrationRepository {
	findByProjectId(projectId: string): Promise<GiteaIntegrationResponse | null>;
	create(input: CreateGiteaIntegrationInput): Promise<GiteaIntegrationResponse>;
	update(
		projectId: string,
		input: UpdateGiteaIntegrationInput,
	): Promise<GiteaIntegrationResponse>;
	delete(projectId: string): Promise<{ success: boolean; message: string }>;
}
