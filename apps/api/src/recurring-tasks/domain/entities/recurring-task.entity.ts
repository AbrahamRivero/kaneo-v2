export interface RecurringTask {
	id: string;
	projectId: string;
	title: string;
	description: string | null;
	frequency: string | null;
	intervalValue: number | null;
	dayOfWeek: number | null;
	dayOfMonth: number | null;
	cronExpression: string | null;
	nextRunAt: Date;
	lastRunAt: Date | null;
	isActive: boolean;
	columnId: string | null;
	assigneeId: string | null;
	createdBy: string | null;
	priority: string | null;
	dueDateDaysOffset: number | null;
	labelIds: string[] | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface RecurringTaskChecklistItem {
	id: string;
	recurringTaskId: string;
	text: string;
	position: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface RecurringTaskWithChecklist extends RecurringTask {
	checklistItems: RecurringTaskChecklistItem[];
}
