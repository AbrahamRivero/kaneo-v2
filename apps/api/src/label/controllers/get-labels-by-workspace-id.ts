import { createLabelUseCases } from "../application";

const { getLabelsByWorkspace } = createLabelUseCases();

async function getLabelsByWorkspaceIdController(workspaceId: string) {
	return getLabelsByWorkspace.execute(workspaceId);
}

export default getLabelsByWorkspaceIdController;
