export * from "./ports/template-repository.port";

import { templateRepository } from "../infrastructure/repositories/drizzle-template.repository";
import {
	CreateTemplateUseCase,
	DeleteTemplateUseCase,
	GetTemplateUseCase,
	ListTemplatesUseCase,
	UpdateTemplateUseCase,
} from "./use-cases";

export const createTemplateUseCases = () => ({
	createTemplate: new CreateTemplateUseCase(templateRepository),
	getTemplate: new GetTemplateUseCase(templateRepository),
	listTemplates: new ListTemplatesUseCase(templateRepository),
	updateTemplate: new UpdateTemplateUseCase(templateRepository),
	deleteTemplate: new DeleteTemplateUseCase(templateRepository),
});
