import { HTTPException } from "hono/http-exception";
import type { Project } from "../../domain";
import type { ProjectRepository, UpdateProjectInput } from "../ports";

export class UpdateProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(
		id: string,
		workspaceId: string,
		input: UpdateProjectInput,
	): Promise<Project> {
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

		return this.projectRepository.update(id, input);
	}
}
