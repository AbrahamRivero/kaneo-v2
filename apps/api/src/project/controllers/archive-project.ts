import { ArchiveProjectUseCase } from "../application/use-cases/archive-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function archiveProject(id: string, workspaceId: string) {
	const useCase = new ArchiveProjectUseCase(projectRepository);
	return useCase.execute(id, workspaceId);
}

export default archiveProject;
