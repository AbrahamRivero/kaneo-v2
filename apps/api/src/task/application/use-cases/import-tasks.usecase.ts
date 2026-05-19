import { HTTPException } from "hono/http-exception";
import { columnRepository } from "../../../column/infrastructure/repositories/drizzle-column.repository";
import type { ImportTask } from "../../domain";
import {
	coercePriority,
	coerceStatus,
	getValidTaskStatuses,
} from "../../validate-task-fields";
import type { TaskRepository } from "../ports/task-repository.port";

interface ImportTaskResult {
	success: boolean;
	task?: unknown;
	error?: string;
	warnings?: string[];
}

export interface ImportTasksInput {
	projectId: string;
	tasks: ImportTask[];
	currentUserId: string;
}

export interface ImportTasksResult {
	importedAt: string;
	project: {
		id: string;
		name: string;
		slug: string;
	};
	results: {
		total: number;
		successful: number;
		failed: number;
		tasks: ImportTaskResult[];
	};
}

export class ImportTasksUseCase {
	constructor(
		private taskRepository: TaskRepository,
		private eventPublisher: {
			publish: (eventType: string, data: unknown) => Promise<void>;
		},
	) {}

	async execute(input: ImportTasksInput): Promise<ImportTasksResult> {
		const project = await this.taskRepository.getProject(input.projectId);

		if (!project) {
			throw new HTTPException(404, {
				message: "Project not found",
			});
		}

		let taskNumber = await this.taskRepository.getNextTaskNumber(
			input.projectId,
		);
		const validStatuses = await getValidTaskStatuses(input.projectId);

		const results: ImportTaskResult[] = [];

		for (const taskData of input.tasks) {
			try {
				const { status, warning: statusWarning } = coerceStatus(
					taskData.status,
					validStatuses,
				);
				const { priority, warning: priorityWarning } = coercePriority(
					taskData.priority || "low",
				);
				const warnings = [statusWarning, priorityWarning].filter(
					(w): w is string => !!w,
				);

				const columns = await columnRepository.findByProjectId(input.projectId);
				const column = columns.find((c) => c.slug === status);

				const createdTask = await this.taskRepository.insertTask({
					projectId: input.projectId,
					userId: taskData.userId || null,
					title: taskData.title,
					status,
					columnId: column?.id ?? null,
					startDate: taskData.startDate ? new Date(taskData.startDate) : null,
					dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
					description: taskData.description || "",
					priority,
					number: ++taskNumber,
				});

				await this.eventPublisher.publish("task.created", {
					...createdTask,
					taskId: createdTask.id,
					userId: createdTask.userId ?? "",
					currentUserId: input.currentUserId,
					type: "create",
					content: "imported the task",
				});

				results.push({
					success: true,
					task: createdTask,
					...(warnings.length > 0 && { warnings }),
				});
			} catch (error) {
				if (error instanceof HTTPException) {
					throw error;
				}
				results.push({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					task: taskData,
				});
			}
		}

		return {
			importedAt: new Date().toISOString(),
			project: {
				id: project.id,
				name: project.name,
				slug: project.slug,
			},
			results: {
				total: input.tasks.length,
				successful: results.filter((r) => r.success).length,
				failed: results.filter((r) => !r.success).length,
				tasks: results,
			},
		};
	}
}
