import { DeleteProjectUseCase } from "../application/use-cases/delete-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function deleteProject(id: string, workspaceId: string) {
	const useCase = new DeleteProjectUseCase(projectRepository);
	return useCase.execute(id, workspaceId);
}

export default deleteProject;
