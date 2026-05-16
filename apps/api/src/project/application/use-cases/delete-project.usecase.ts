import { HTTPException } from "hono/http-exception";
import type { Project } from "../../domain";
import type { ProjectRepository } from "../ports";

export class DeleteProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(id: string, workspaceId: string): Promise<Project> {
		const existingProject = await this.projectRepository.findByIdAndWorkspace(
			id,
			workspaceId,
		);

		if (!existingProject) {
			throw new HTTPException(404, {
				message:
					"Project doesn't exist or doesn't belong to the specified workspace",
			});
		}

		await this.projectRepository.delete(id);

		return existingProject;
	}
}
