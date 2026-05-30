import type {
	CreateLabelInput,
	Label,
	LabelWithRelations,
	UpdateLabelInput,
} from "../../domain";

export interface LabelRepository {
	findById(id: string): Promise<Label | null>;
	findByWorkspaceId(workspaceId: string): Promise<Label[]>;
	findByTaskId(taskId: string): Promise<Label[]>;
	create(input: CreateLabelInput): Promise<LabelWithRelations>;
	update(input: UpdateLabelInput): Promise<Label[]>;
	delete(id: string): Promise<Label>;
	assignToTask(labelId: string, taskId: string): Promise<Label>;
	unassignFromTask(labelId: string): Promise<Label>;
	findTaskById(taskId: string): Promise<{
		id: string;
		projectId: string;
		workspaceId: string;
	} | null>;
}
