import { publishEvent } from "../../events";
import { CreateProjectUseCase } from "../application/use-cases/create-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

const eventPublisher = {
	publish: async (eventType: string, data: unknown) => {
		await publishEvent(eventType, data);
	},
};

async function createProjectCtrl(
	workspaceId: string,
	name: string,
	icon: string,
	slug: string,
	templateId?: string,
	userId?: string,
) {
	const useCase = new CreateProjectUseCase(projectRepository, eventPublisher);
	const project = await useCase.execute({
		workspaceId,
		name,
		icon,
		slug,
		templateId,
		userId,
	});

	return project;
}

export default createProjectCtrl;
