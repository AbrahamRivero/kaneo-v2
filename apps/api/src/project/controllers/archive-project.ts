import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function archiveProject(id: string, workspaceId: string) {
	const existingProject = await projectRepository.findByIdAndWorkspace(
		id,
		workspaceId,
	);

	if (!existingProject) {
		throw new HTTPException(404, {
			message:
				"Project doesn't exist or doesn't belong to the specified workspace",
		});
	}

	return projectRepository.archive(id);
}

export default archiveProject;
