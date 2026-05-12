export interface CreateLabelInput {
	name: string;
	color: string;
	taskId?: string;
	workspaceId: string;
	currentUserId: string;
}

export interface UpdateLabelInput {
	id: string;
	name: string;
	color: string;
}

export interface AssignLabelInput {
	labelId: string;
	taskId: string;
	userId: string;
}

export interface UnassignLabelInput {
	labelId: string;
	userId: string;
}

export interface DeleteLabelInput {
	id: string;
	userId: string;
}
