import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";
import getProject from "./get-project";

async function deleteProject(id: string, workspaceId: string) {
	const existingProject = await getProject(id, workspaceId);

	await projectRepository.delete(id);

	return existingProject;
}

export default deleteProject;
