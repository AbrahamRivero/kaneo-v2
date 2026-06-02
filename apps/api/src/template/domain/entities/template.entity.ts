export interface Template {
	id: string;
	workspaceId: string | null;
	name: string;
	description: string | null;
	icon: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TemplateColumn {
	id: string;
	templateId: string;
	name: string;
	slug: string;
	position: number;
	color: string | null;
	isFinal: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TemplateTask {
	id: string;
	templateId: string;
	title: string;
	description: string | null;
	columnSlug: string;
	priority: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TemplateWithRelations extends Template {
	columns: TemplateColumn[];
	tasks: TemplateTask[];
}
