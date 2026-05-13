import { GetProjectsUseCase } from "../application/use-cases/get-projects.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function getProjects(workspaceId: string, includeArchived = false) {
	const useCase = new GetProjectsUseCase(projectRepository);
	return useCase.execute(workspaceId, includeArchived);
}

export default getProjects;
