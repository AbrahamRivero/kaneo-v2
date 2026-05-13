import { HTTPException } from "hono/http-exception";
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

	const updatedProject = await projectRepository.update(id, {
		name,
		icon,
		slug,
		description,
		isPublic,
	});

	return updatedProject;
}

export default updateProject;
