import { HTTPException } from "hono/http-exception";
import type { TemplateWithRelations, UpdateTemplateInput } from "../../domain";
import type { TemplateRepository } from "../ports/template-repository.port";

export class UpdateTemplateUseCase {
	constructor(private templateRepository: TemplateRepository) {}

	async execute(
		templateId: string,
		input: UpdateTemplateInput,
	): Promise<TemplateWithRelations> {
		const existing = await this.templateRepository.findById(templateId);

		if (!existing) {
			throw new HTTPException(404, { message: "Template not found" });
		}

		return this.templateRepository.update(templateId, input);
	}
}
