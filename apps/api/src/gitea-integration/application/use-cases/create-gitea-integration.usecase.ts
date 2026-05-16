import type {
	CreateGiteaIntegrationInput,
	GiteaIntegrationResponse,
} from "../../domain";
import type { GiteaIntegrationRepository } from "../ports";

export class CreateGiteaIntegrationUseCase {
	constructor(private repository: GiteaIntegrationRepository) {}

	async execute(
		input: CreateGiteaIntegrationInput,
	): Promise<GiteaIntegrationResponse> {
		return this.repository.create(input);
	}
}
