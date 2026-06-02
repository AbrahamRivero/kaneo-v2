export type ChecklistItemInput = {
	text: string;
	position: number;
};

export type CreateRecurringTaskInput = {
	projectId: string;
	title: string;
	description?: string;
	frequency?: string;
	intervalValue?: number;
	dayOfWeek?: number;
	dayOfMonth?: number;
	cronExpression?: string;
	nextRunAt: Date;
	isActive?: boolean;
	columnId?: string;
	assigneeId?: string;
	createdBy?: string;
	priority?: string;
	dueDateDaysOffset?: number;
	labelIds?: string[];
	checklistItems?: ChecklistItemInput[];
};

export type UpdateRecurringTaskInput = {
	title?: string;
	description?: string | null;
	frequency?: string;
	intervalValue?: number;
	dayOfWeek?: number | null;
	dayOfMonth?: number | null;
	cronExpression?: string | null;
	nextRunAt?: Date;
	isActive?: boolean;
	columnId?: string | null;
	assigneeId?: string | null;
	priority?: string | null;
	dueDateDaysOffset?: number | null;
	labelIds?: string[] | null;
	checklistItems?: ChecklistItemInput[];
};

export type CreateChecklistItemInput = {
	recurringTaskId: string;
	text: string;
	position: number;
};
