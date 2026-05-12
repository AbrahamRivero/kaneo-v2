import { createLabelUseCases } from "../application";

const { assignLabelToTask } = createLabelUseCases();

async function assignLabelToTaskController(
	id: string,
	taskId: string,
	userId: string,
) {
	return assignLabelToTask.execute({ labelId: id, taskId, userId });
}

export default assignLabelToTaskController;
