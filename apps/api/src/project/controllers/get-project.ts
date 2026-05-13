import { GetProjectUseCase } from "../application/use-cases/get-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function getProject(id: string, workspaceId: string) {
	const useCase = new GetProjectUseCase(projectRepository);
	return useCase.execute(id, workspaceId);
}

export default getProject;
