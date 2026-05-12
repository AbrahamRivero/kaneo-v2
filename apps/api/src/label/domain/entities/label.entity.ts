export interface Label {
	id: string;
	name: string;
	color: string;
	taskId: string | null;
	workspaceId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LabelWithRelations extends Label {
	task?: {
		id: string;
		projectId: string;
		workspaceId: string;
	} | null;
}
