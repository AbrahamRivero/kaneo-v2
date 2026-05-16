import type { GiteaServicePort } from "../ports";

export class ListGiteaRepositoriesUseCase {
	constructor(private service: GiteaServicePort) {}

	async execute(baseUrl: string, accessToken: string) {
		return this.service.listRepositories(baseUrl, accessToken);
	}
}
