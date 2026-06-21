export * from "./ports";
export * from "./use-cases";

import { publishEvent } from "../../events";
import { columnQueryAdapter } from "../infrastructure/adapters/drizzle-column-query.adapter";
import { DrizzleTaskRepository } from "../infrastructure/repositories/drizzle-task.repository";
import {
	BulkUpdateTasksUseCase,
	CreateTaskImageUploadUseCase,
	CreateTaskUseCase,
	DeleteTaskUseCase,
	ExportTasksUseCase,
	FinalizeTaskImageUploadUseCase,
	GetTasksUseCase,
	GetTaskUseCase,
	ImportTasksUseCase,
	MoveTaskUseCase,
	UpdateTaskAssigneeUseCase,
	UpdateTaskDescriptionUseCase,
	UpdateTaskDueDateUseCase,
	UpdateTaskPriorityUseCase,
	UpdateTaskStatusUseCase,
	UpdateTaskTitleUseCase,
	UpdateTaskUseCase,
} from "./use-cases";

const taskRepository = new DrizzleTaskRepository();

const eventPublisher = {
	publish: async (eventType: string, data: unknown) => {
		await publishEvent(eventType, data);
	},
};

export const createTaskUseCases = () => ({
	createTask: new CreateTaskUseCase(taskRepository, eventPublisher),
	getTask: new GetTaskUseCase(taskRepository),
	getTasks: new GetTasksUseCase(taskRepository),
	updateTask: new UpdateTaskUseCase(taskRepository, eventPublisher),
	deleteTask: new DeleteTaskUseCase(taskRepository, eventPublisher),
	updateTaskStatus: new UpdateTaskStatusUseCase(taskRepository, eventPublisher),
	updateTaskPriority: new UpdateTaskPriorityUseCase(
		taskRepository,
		eventPublisher,
	),
	updateTaskAssignee: new UpdateTaskAssigneeUseCase(
		taskRepository,
		eventPublisher,
	),
	updateTaskDueDate: new UpdateTaskDueDateUseCase(
		taskRepository,
		eventPublisher,
	),
	updateTaskTitle: new UpdateTaskTitleUseCase(taskRepository, eventPublisher),
	updateTaskDescription: new UpdateTaskDescriptionUseCase(
		taskRepository,
		eventPublisher,
	),
	exportTasks: new ExportTasksUseCase(taskRepository),
	bulkUpdateTasks: new BulkUpdateTasksUseCase(taskRepository, eventPublisher),
	moveTask: new MoveTaskUseCase(taskRepository, eventPublisher),
	importTasks: new ImportTasksUseCase(
		taskRepository,
		columnQueryAdapter,
		eventPublisher,
	),
	createTaskImageUpload: new CreateTaskImageUploadUseCase(taskRepository),
	finalizeTaskImageUpload: new FinalizeTaskImageUploadUseCase(taskRepository),
});
