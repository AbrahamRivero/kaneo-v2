import { createLabelUseCases } from "../application";

const { getLabelsByTask } = createLabelUseCases();

async function getLabelsByTaskIdController(taskId: string) {
	return getLabelsByTask.execute(taskId);
}

export default getLabelsByTaskIdController;
