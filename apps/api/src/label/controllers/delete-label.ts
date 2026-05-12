import { createLabelUseCases } from "../application";

const { deleteLabel } = createLabelUseCases();

async function deleteLabelController(id: string, userId: string) {
	return deleteLabel.execute({ id, userId });
}

export default deleteLabelController;
