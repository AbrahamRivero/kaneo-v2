import type { InferSelectModel } from "drizzle-orm";
import type { taskTable } from "../../../database/schema";
import type { Task, TaskWithRelations } from "../../domain";

type TaskRow = InferSelectModel<typeof taskTable>;

export function mapTaskToEntity(row: TaskRow): Task {
	return {
		id: row.id,
		projectId: row.projectId,
		userId: row.userId,
		title: row.title,
		description: row.description,
		status: row.status,
		priority: row.priority as Task["priority"],
		startDate: row.startDate,
		dueDate: row.dueDate,
		position: row.position,
		number: row.number,
		columnId: row.columnId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapTaskWithRelationsToEntity(
	task: TaskRow & {
		assigneeName?: string | null;
		columnName?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
	},
): TaskWithRelations {
	return {
		...mapTaskToEntity(task),
		assigneeName: task.assigneeName ?? null,
		columnName: task.columnName ?? null,
		labels: task.labels ?? [],
	};
}
