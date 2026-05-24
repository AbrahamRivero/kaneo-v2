import db from "../../database";
import { recurringTaskTable } from "../../database/schema";

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
	priority?: string;
};

async function createRecurringTask(data: CreateRecurringTaskInput) {
	const [task] = await db.insert(recurringTaskTable).values(data).returning();

	return task;
}

export default createRecurringTask;
