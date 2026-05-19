import type {
	BulkOperationInput,
	BulkOperationResult,
	CreateTaskInput,
	ExportTasksResult,
	MoveTaskInput,
	MoveTaskResult,
	Task,
	TaskContext,
	TaskFilters,
	TaskListResult,
	TaskWithRelations,
	UpdateTaskInput,
	UpsertTaskAssetInput,
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
	getProject(
		projectId: string,
	): Promise<{ id: string; name: string; slug: string } | null>;
	findTaskContext(taskId: string): Promise<TaskContext | null>;
	upsertTaskAsset(
		input: UpsertTaskAssetInput,
	): Promise<{ id: string; url: string }>;
	getNextTaskNumber(projectId: string): Promise<number>;
	insertTask(data: {
		projectId: string;
		userId: string | null;
		title: string;
		status: string;
		columnId: string | null;
		startDate: Date | null;
		dueDate: Date | null;
		description: string;
		priority: string;
		number: number;
	}): Promise<Task>;
}
