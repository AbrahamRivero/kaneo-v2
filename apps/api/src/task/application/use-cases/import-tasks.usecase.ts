import { and, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { columnTable, projectTable, taskTable } from "../../../database/schema";
import { publishEvent } from "../../../events";
import type { ImportTask } from "../../domain";
import {
	coercePriority,
	coerceStatus,
	getValidTaskStatuses,
} from "../../validate-task-fields";

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
	async execute(input: ImportTasksInput): Promise<ImportTasksResult> {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, input.projectId),
		});

		if (!project) {
			throw new HTTPException(404, {
				message: "Project not found",
			});
		}

		let taskNumber = await this.getNextTaskNumber(input.projectId);
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

				const column = await db.query.columnTable.findFirst({
					where: and(
						eq(columnTable.projectId, input.projectId),
						eq(columnTable.slug, status),
					),
				});

				const [createdTask] = await db
					.insert(taskTable)
					.values({
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
					})
					.returning();

				if (createdTask) {
					await publishEvent("task.created", {
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
				} else {
					results.push({
						success: false,
						error: "Failed to create task",
						task: taskData,
					});
				}
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

	private async getNextTaskNumber(projectId: string): Promise<number> {
		const [lastTask] = await db
			.select({ number: taskTable.number })
			.from(taskTable)
			.where(eq(taskTable.projectId, projectId))
			.orderBy(desc(taskTable.number))
			.limit(1);

		return lastTask?.number ?? 0;
	}
}
