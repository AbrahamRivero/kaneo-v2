import { createLabelUseCases } from "../application";

const { updateLabel } = createLabelUseCases();

async function updateLabelController(id: string, name: string, color: string) {
	return updateLabel.execute({ id, name, color });
}

export default updateLabelController;
