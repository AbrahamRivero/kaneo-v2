import { createLabelUseCases } from "../application";

const { unassignLabelFromTask } = createLabelUseCases();

async function unassignLabelFromTaskController(id: string, userId: string) {
	return unassignLabelFromTask.execute({ labelId: id, userId });
}

export default unassignLabelFromTaskController;
