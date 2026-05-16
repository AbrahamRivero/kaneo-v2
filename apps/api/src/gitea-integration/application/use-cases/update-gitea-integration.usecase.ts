import type {
	GiteaIntegrationResponse,
	UpdateGiteaIntegrationInput,
} from "../../domain";
import type { GiteaIntegrationRepository } from "../ports";

export class UpdateGiteaIntegrationUseCase {
	constructor(private repository: GiteaIntegrationRepository) {}

	async execute(
		projectId: string,
		input: UpdateGiteaIntegrationInput,
	): Promise<GiteaIntegrationResponse> {
		return this.repository.update(projectId, input);
	}
}
