import { UnarchiveProjectUseCase } from "../application/use-cases/unarchive-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function unarchiveProject(id: string, workspaceId: string) {
	const useCase = new UnarchiveProjectUseCase(projectRepository);
	return useCase.execute(id, workspaceId);
}

export default unarchiveProject;
