import { createTemplateUseCases } from "../application";

const { deleteTemplate } = createTemplateUseCases();

async function deleteTemplateController(templateId: string) {
	return deleteTemplate.execute(templateId);
}

export default deleteTemplateController;
