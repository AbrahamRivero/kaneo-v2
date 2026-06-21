import type { TaskPriority } from "../entities/task.entity";

export interface CreateTaskInput {
	projectId: string;
	currentUserId: string;
	userId?: string;
	createdBy?: string;
	title: string;
	description?: string;
	startDate?: Date;
	dueDate?: Date;
	priority?: TaskPriority;
	status: string;
	recurringTaskId?: string;
}

export interface UpdateTaskInput {
	id: string;
	currentUserId: string;
	title?: string;
	description?: string;
	startDate?: Date | null;
	dueDate?: Date | null;
	priority?: TaskPriority;
	status?: string;
	projectId?: string;
	position?: number;
	userId?: string | null;
	columnId?: string | null;
}

export interface TaskFilters {
	status?: string;
	priority?: string;
	assigneeId?: string;
	page?: number;
	limit?: number;
	sortBy?:
		| "createdAt"
		| "priority"
		| "dueDate"
		| "position"
		| "title"
		| "number";
	sortOrder?: "asc" | "desc";
	dueBefore?: string;
	dueAfter?: string;
}

export interface TaskListResult {
	tasks: import("../entities/task.entity").TaskWithRelations[];
	total: number;
	page: number;
	limit: number;
}

export interface BulkOperationInput {
	taskIds: string[];
	operation:
		| "updateStatus"
		| "updatePriority"
		| "updateAssignee"
		| "delete"
		| "addLabel"
		| "removeLabel"
		| "updateDueDate";
	value?: string | null;
	currentUserId: string;
}

export interface BulkOperationResult {
	success: boolean;
	updatedCount: number;
}

export interface MoveTaskInput {
	taskId: string;
	destinationProjectId: string;
	destinationStatus?: string;
	currentUserId: string;
}

export interface MoveTaskResult {
	task: import("../entities/task.entity").Task;
	sourceProjectId: string;
	destinationProjectId: string;
}

export interface ExportTask {
	title: string;
	description: string | null;
	status: string;
	priority: string;
	startDate: string | null;
	dueDate: string | null;
	assigneeName: string | null;
}

export interface ExportTasksResult {
	project: {
		name: string;
		slug: string;
		description: string | null;
		exportedAt: string;
	};
	tasks: Array<{
		title: string;
		description: string;
		status: string;
		priority: string;
		dueDate: string | null;
		startDate: string | null;
		userId: string | null;
	}>;
}

export interface ImportTask {
	title: string;
	description?: string;
	status: string;
	priority?: string;
	startDate?: string | null;
	dueDate?: string | null;
	userId?: string | null;
}

export interface TaskContext {
	taskId: string;
	projectId: string;
	workspaceId: string;
}

export type UploadSurface = "description" | "comment";

export interface UpsertTaskAssetInput {
	workspaceId: string;
	projectId: string;
	taskId: string;
	objectKey: string;
	filename: string;
	mimeType: string;
	size: number;
	kind: string;
	surface: string;
	createdBy: string | null;
}
