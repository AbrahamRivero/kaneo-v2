import { HTTPException } from "hono/http-exception";
import type { TemplateRepository } from "../ports/template-repository.port";

export class DeleteTemplateUseCase {
	constructor(private templateRepository: TemplateRepository) {}

	async execute(templateId: string): Promise<{ success: boolean }> {
		const existing = await this.templateRepository.findById(templateId);

		if (!existing) {
			throw new HTTPException(404, { message: "Template not found" });
		}

		await this.templateRepository.delete(templateId);

		return { success: true };
	}
}
