import type { GiteaIntegrationRepository } from "../ports";

export class DeleteGiteaIntegrationUseCase {
	constructor(private repository: GiteaIntegrationRepository) {}

	async execute(projectId: string) {
		return this.repository.delete(projectId);
	}
}
