import { publishEvent } from "../../events";
import { CreateProjectUseCase } from "../application/use-cases/create-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function createProjectCtrl(
	workspaceId: string,
	name: string,
	icon: string,
	slug: string,
	templateId?: string,
	userId?: string,
) {
	const useCase = new CreateProjectUseCase(projectRepository);
	const project = await useCase.execute({
		workspaceId,
		name,
		icon,
		slug,
		templateId,
	});

	await publishEvent("project.created", {
		projectId: project.id,
		workspaceId: project.workspaceId,
		name: project.name,
		slug: project.slug,
		userId,
	});

	return project;
}

export default createProjectCtrl;
