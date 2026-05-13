import { HTTPException } from "hono/http-exception";
import { projectRepository } from "../infrastructure/repositories/drizzle-project.repository";

async function unarchiveProject(id: string, workspaceId: string) {
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

	return projectRepository.unarchive(id);
}

export default unarchiveProject;
