import type { Workspace } from "../../domain";
import type { WorkspaceRepository } from "../ports/workspace-repository.port";

export class GetWorkspaceUseCase {
	constructor(private workspaceRepository: WorkspaceRepository) {}

	async execute(id: string): Promise<Workspace> {
		const workspace = await this.workspaceRepository.findById(id);
		if (!workspace) {
			throw new Error("Workspace not found");
		}
		return workspace;
	}
}

export class GetWorkspaceBySlugUseCase {
	constructor(private workspaceRepository: WorkspaceRepository) {}

	async execute(slug: string): Promise<Workspace> {
		const workspace = await this.workspaceRepository.findBySlug(slug);
		if (!workspace) {
			throw new Error("Workspace not found");
		}
		return workspace;
	}
}
