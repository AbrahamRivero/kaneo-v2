import db from "../../database";
import { recurringTaskTable } from "../../database/schema";
import { publishEvent } from "../../events";

type CreateRecurringTaskInput = {
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
};

async function createRecurringTask(data: CreateRecurringTaskInput) {
	const { createdBy, projectId, ...insertData } = data;
	const [task] = await db
		.insert(recurringTaskTable)
		.values({ ...insertData, projectId, createdBy: createdBy ?? null })
		.returning();

	await publishEvent("recurring_task.created", {
		recurringTaskId: task.id,
		projectId,
		userId: createdBy ?? "",
	});

	return task;
}

export default createRecurringTask;
