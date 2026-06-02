import type { InferSelectModel } from "drizzle-orm";
import type {
	recurringTaskChecklistItemTable,
	recurringTaskTable,
} from "../../../database/schema";
import type { RecurringTask, RecurringTaskChecklistItem } from "../../domain";

type RecurringTaskRow = InferSelectModel<typeof recurringTaskTable>;
type ChecklistItemRow = InferSelectModel<
	typeof recurringTaskChecklistItemTable
>;

export function mapRecurringTaskToEntity(row: RecurringTaskRow): RecurringTask {
	return {
		id: row.id,
		projectId: row.projectId,
		title: row.title,
		description: row.description,
		frequency: row.frequency,
		intervalValue: row.intervalValue,
		dayOfWeek: row.dayOfWeek,
		dayOfMonth: row.dayOfMonth,
		cronExpression: row.cronExpression,
		nextRunAt: row.nextRunAt,
		lastRunAt: row.lastRunAt,
		isActive: row.isActive,
		columnId: row.columnId,
		assigneeId: row.assigneeId,
		createdBy: row.createdBy,
		priority: row.priority,
		dueDateDaysOffset: row.dueDateDaysOffset,
		labelIds: row.labelIds,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapChecklistItemToEntity(
	row: ChecklistItemRow,
): RecurringTaskChecklistItem {
	return {
		id: row.id,
		recurringTaskId: row.recurringTaskId,
		text: row.text,
		position: row.position,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}
