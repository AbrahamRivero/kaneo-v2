import type { TemplateWithRelations } from "../../domain";
import type { TemplateRepository } from "../ports/template-repository.port";

export class ListTemplatesUseCase {
	constructor(private templateRepository: TemplateRepository) {}

	async execute(workspaceId: string): Promise<TemplateWithRelations[]> {
		return this.templateRepository.findByWorkspaceId(workspaceId);
	}
}
