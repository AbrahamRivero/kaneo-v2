import { createTemplateUseCases } from "../application";
import type { CreateTemplateInput } from "../domain";

const { createTemplate } = createTemplateUseCases();

async function createTemplateController(input: CreateTemplateInput) {
	return createTemplate.execute(input);
}

export default createTemplateController;
