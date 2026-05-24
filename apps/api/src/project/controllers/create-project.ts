import { CreateProjectUseCase } from "../application/use-cases/create-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function createProjectCtrl(
	workspaceId: string,
	name: string,
	icon: string,
	slug: string,
	templateId?: string,
) {
	const useCase = new CreateProjectUseCase(projectRepository);
	return useCase.execute({ workspaceId, name, icon, slug, templateId });
}

export default createProjectCtrl;
