import type {
	BulkOperationInput,
	BulkOperationResult,
	CreateTaskInput,
	ExportTasksResult,
	MoveTaskInput,
	MoveTaskResult,
	Task,
	TaskFilters,
	TaskListResult,
	TaskWithRelations,
	UpdateTaskInput,
} from "../../domain";

export interface TaskRepository {
	exportTasks(projectId: string): Promise<ExportTasksResult>;
	getProjectWorkspaceId(projectId: string): Promise<string | null>;
	findById(id: string): Promise<TaskWithRelations | null>;
	findByProjectId(
		projectId: string,
		filters?: TaskFilters,
	): Promise<TaskListResult>;
	create(input: CreateTaskInput): Promise<TaskWithRelations>;
	update(input: UpdateTaskInput): Promise<TaskWithRelations>;
	delete(id: string): Promise<TaskWithRelations>;
	bulkUpdate(input: BulkOperationInput): Promise<BulkOperationResult>;
	move(input: MoveTaskInput): Promise<MoveTaskResult>;
	findByIds(ids: string[]): Promise<Task[]>;
	updateStatus(taskId: string, status: string, userId: string): Promise<Task>;
	updatePriority(
		taskId: string,
		priority: string,
		userId: string,
	): Promise<Task>;
	updateAssignee(
		taskId: string,
		userId: string,
		currentUserId: string,
	): Promise<Task>;
	updateDueDate(
		taskId: string,
		dueDate: Date | null,
		currentUserId: string,
	): Promise<Task>;
	updateTitle(
		taskId: string,
		title: string,
		currentUserId: string,
	): Promise<Task>;
	updateDescription(
		taskId: string,
		description: string,
		currentUserId: string,
	): Promise<Task>;
}
