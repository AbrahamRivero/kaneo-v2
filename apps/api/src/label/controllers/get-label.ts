import { createLabelUseCases } from "../application";

const { getLabel } = createLabelUseCases();

async function getLabelController(id: string) {
	return getLabel.execute(id);
}

export default getLabelController;
