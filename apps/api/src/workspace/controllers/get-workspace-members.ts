import { createWorkspaceUseCases } from "../application";

const { getWorkspaceMembers } = createWorkspaceUseCases();

async function getWorkspaceMembersController(workspaceId: string) {
	return getWorkspaceMembers.execute(workspaceId);
}

export default getWorkspaceMembersController;
