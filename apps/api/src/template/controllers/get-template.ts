import { createTemplateUseCases } from "../application";

const { getTemplate } = createTemplateUseCases();

async function getTemplateController(templateId: string) {
	return getTemplate.execute(templateId);
}

export default getTemplateController;
