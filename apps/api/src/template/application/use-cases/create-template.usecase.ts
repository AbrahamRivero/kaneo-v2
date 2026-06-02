import { createId } from "@paralleldrive/cuid2";
import type { CreateTemplateInput, TemplateWithRelations } from "../../domain";
import type { TemplateRepository } from "../ports/template-repository.port";

export class CreateTemplateUseCase {
	constructor(private templateRepository: TemplateRepository) {}

	async execute(input: CreateTemplateInput): Promise<TemplateWithRelations> {
		return this.templateRepository.create({
			...input,
			id: createId(),
		});
	}
}
