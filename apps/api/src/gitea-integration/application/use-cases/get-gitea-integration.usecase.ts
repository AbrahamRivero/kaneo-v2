import type { GiteaIntegrationResponse } from "../../domain";
import type { GiteaIntegrationRepository } from "../ports";

export class GetGiteaIntegrationUseCase {
	constructor(private repository: GiteaIntegrationRepository) {}

	async execute(projectId: string): Promise<GiteaIntegrationResponse | null> {
		return this.repository.findByProjectId(projectId);
	}
}
