import type { ProjectWithStatistics } from "../../domain";
import type { ProjectRepository } from "../ports";

export class GetProjectsUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(
		workspaceId: string,
		includeArchived = false,
	): Promise<ProjectWithStatistics[]> {
		const projects = await this.projectRepository.findByWorkspaceId(
			workspaceId,
			includeArchived,
		);

		return projects.map((project) => ({
			...project,
			statistics: {
				completionPercentage: 0,
				totalTasks: 0,
				dueDate: null,
			},
			archivedTasks: [],
			plannedTasks: [],
			columns: [],
		}));
	}
}
