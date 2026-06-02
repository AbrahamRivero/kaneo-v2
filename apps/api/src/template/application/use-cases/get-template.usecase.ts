import { HTTPException } from "hono/http-exception";
import type { TemplateWithRelations } from "../../domain";
import type { TemplateRepository } from "../ports/template-repository.port";

export class GetTemplateUseCase {
	constructor(private templateRepository: TemplateRepository) {}

	async execute(templateId: string): Promise<TemplateWithRelations> {
		const template = await this.templateRepository.findById(templateId);

		if (!template) {
			throw new HTTPException(404, { message: "Template not found" });
		}

		return template;
	}
}
