import { HTTPException } from "hono/http-exception";
import type { ProjectWithTasks } from "../../domain";
import type { ProjectRepository } from "../ports";

export class GetProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(id: string, workspaceId: string): Promise<ProjectWithTasks> {
		const project = await this.projectRepository.findByIdAndWorkspace(
			id,
			workspaceId,
		);

		if (!project) {
			throw new HTTPException(404, {
				message: "Project not found",
			});
		}

		const projectWithTasks = await this.projectRepository.findByIdWithTasks(id);

		if (!projectWithTasks) {
			throw new HTTPException(404, {
				message: "Project not found",
			});
		}

		return projectWithTasks as ProjectWithTasks;
	}
}
