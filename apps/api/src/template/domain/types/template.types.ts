export type ColumnInput = {
	name: string;
	slug: string;
	position: number;
	color?: string;
	isFinal?: boolean;
};

export type TaskInput = {
	title: string;
	description?: string;
	columnSlug: string;
	priority?: string;
};

export type CreateTemplateInput = {
	workspaceId: string;
	name: string;
	description?: string;
	icon?: string;
	columns: ColumnInput[];
	tasks?: TaskInput[];
};

export type UpdateTemplateInput = {
	name?: string;
	description?: string | null;
	icon?: string;
	columns?: ColumnInput[];
	tasks?: TaskInput[];
};
