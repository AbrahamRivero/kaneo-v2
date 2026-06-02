export * from "./ports/recurring-task-repository.port";

import { recurringTaskRepository } from "../infrastructure/repositories/drizzle-recurring-task.repository";
import {
	CreateChecklistItemUseCase,
	CreateRecurringTaskUseCase,
	DeleteChecklistItemUseCase,
	DeleteRecurringTaskUseCase,
	ListChecklistItemsUseCase,
	ListRecurringTasksUseCase,
	UpdateRecurringTaskUseCase,
} from "./use-cases";

export const createRecurringTaskUseCases = () => ({
	createRecurringTask: new CreateRecurringTaskUseCase(recurringTaskRepository),
	listRecurringTasks: new ListRecurringTasksUseCase(recurringTaskRepository),
	updateRecurringTask: new UpdateRecurringTaskUseCase(recurringTaskRepository),
	deleteRecurringTask: new DeleteRecurringTaskUseCase(recurringTaskRepository),
	createChecklistItem: new CreateChecklistItemUseCase(recurringTaskRepository),
	listChecklistItems: new ListChecklistItemsUseCase(recurringTaskRepository),
	deleteChecklistItem: new DeleteChecklistItemUseCase(recurringTaskRepository),
});
