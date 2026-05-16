import { UpdateProjectUseCase } from "../application/use-cases/update-project.usecase";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function updateProject(
	id: string,
	name: string,
	icon: string,
	slug: string,
	description: string,
	isPublic: boolean,
	workspaceId: string,
) {
	const useCase = new UpdateProjectUseCase(projectRepository);
	return useCase.execute(id, workspaceId, {
		name,
		icon,
		slug,
		description,
		isPublic,
	});
}

export default updateProject;
