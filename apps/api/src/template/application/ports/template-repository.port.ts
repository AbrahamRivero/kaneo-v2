import type {
	CreateTemplateInput,
	TemplateWithRelations,
	UpdateTemplateInput,
} from "../../domain";

export interface TemplateRepository {
	findById(id: string): Promise<TemplateWithRelations | null>;
	findByWorkspaceId(workspaceId: string): Promise<TemplateWithRelations[]>;
	create(
		input: CreateTemplateInput & { id: string },
	): Promise<TemplateWithRelations>;
	update(
		id: string,
		input: UpdateTemplateInput,
	): Promise<TemplateWithRelations>;
	delete(id: string): Promise<void>;
}
