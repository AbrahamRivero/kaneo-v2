import type { ListRepositoriesResult } from "../../domain";
import type { GitHubServicePort } from "../ports";

export class ListUserRepositoriesUseCase {
	constructor(private service: GitHubServicePort) {}

	async execute(): Promise<ListRepositoriesResult> {
		return this.service.listUserRepositories();
	}
}
