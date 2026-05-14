import type {
	TaskRelation,
	TaskRelationTask,
	TaskRelationWithTasks,
} from "../../domain";

type TaskRelationRow = {
	id: string;
	sourceTaskId: string;
	targetTaskId: string;
	relationType: string;
	createdAt: Date;
};

type TaskRelationWithTasksRow = TaskRelationRow & {
	sourceTaskId: string;
	sourceTaskTitle: string | null;
	sourceTaskStatus: string | null;
	sourceTaskPriority: string | null;
	sourceTaskNumber: number | null;
	sourceTaskProjectId: string | null;
	sourceTaskUserId: string | null;
	sourceTaskAssigneeName: string | null;
	targetTaskId: string;
	targetTaskTitle: string | null;
	targetTaskStatus: string | null;
	targetTaskPriority: string | null;
	targetTaskNumber: number | null;
	targetTaskProjectId: string | null;
	targetTaskUserId: string | null;
	targetTaskAssigneeName: string | null;
};

export function mapToTaskRelation(row: TaskRelationRow): TaskRelation {
	return {
		id: row.id,
		sourceTaskId: row.sourceTaskId,
		targetTaskId: row.targetTaskId,
		relationType: row.relationType,
		createdAt: row.createdAt,
	};
}

function mapToTaskRelationTask(
	prefix: "source" | "target",
	row: TaskRelationWithTasksRow,
): TaskRelationTask | null {
	const id = row[`${prefix}TaskId`];
	if (!id) return null;

	return {
		id,
		title: row[`${prefix}TaskTitle`] ?? "",
		status: row[`${prefix}TaskStatus`] ?? "",
		priority: row[`${prefix}TaskPriority`],
		number: row[`${prefix}TaskNumber`],
		projectId: row[`${prefix}TaskProjectId`] ?? "",
		userId: row[`${prefix}TaskUserId`],
		assigneeName: row[`${prefix}TaskAssigneeName`],
	};
}

export function mapToTaskRelationWithTasks(
	row: TaskRelationWithTasksRow,
): TaskRelationWithTasks {
	return {
		id: row.id,
		sourceTaskId: row.sourceTaskId,
		targetTaskId: row.targetTaskId,
		relationType: row.relationType,
		createdAt: row.createdAt,
		sourceTask: mapToTaskRelationTask("source", row),
		targetTask: mapToTaskRelationTask("target", row),
	};
}
