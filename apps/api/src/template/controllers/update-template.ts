import { createTemplateUseCases } from "../application";
import type { UpdateTemplateInput } from "../domain";

const { updateTemplate } = createTemplateUseCases();

async function updateTemplateController(
	templateId: string,
	input: UpdateTemplateInput,
) {
	return updateTemplate.execute(templateId, input);
}

export default updateTemplateController;
