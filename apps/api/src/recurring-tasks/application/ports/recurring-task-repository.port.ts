import type {
	CreateChecklistItemInput,
	CreateRecurringTaskInput,
	RecurringTask,
	RecurringTaskChecklistItem,
	RecurringTaskWithChecklist,
	UpdateRecurringTaskInput,
} from "../../domain";

export interface RecurringTaskRepository {
	findByProjectId(projectId: string): Promise<RecurringTaskWithChecklist[]>;
	create(input: CreateRecurringTaskInput): Promise<RecurringTask>;
	findById(id: string): Promise<RecurringTask | null>;
	update(id: string, input: UpdateRecurringTaskInput): Promise<RecurringTask>;
	delete(id: string): Promise<RecurringTask>;

	findChecklistItems(
		recurringTaskId: string,
	): Promise<RecurringTaskChecklistItem[]>;
	createChecklistItem(
		input: CreateChecklistItemInput,
	): Promise<RecurringTaskChecklistItem>;
	deleteChecklistItem(
		checklistItemId: string,
	): Promise<RecurringTaskChecklistItem>;
}
