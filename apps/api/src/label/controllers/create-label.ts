import { createLabelUseCases } from "../application";

const { createLabel } = createLabelUseCases();

async function createLabelController(input: {
	name: string;
	color: string;
	taskId?: string;
	workspaceId: string;
	currentUserId: string;
}) {
	return createLabel.execute(input);
}

export default createLabelController;
