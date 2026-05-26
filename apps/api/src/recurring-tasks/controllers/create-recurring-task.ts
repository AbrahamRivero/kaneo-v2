import { createId } from "@paralleldrive/cuid2";
import db from "../../database";
import {
	recurringTaskChecklistItemTable,
	recurringTaskTable,
} from "../../database/schema";
import { publishEvent } from "../../events";

type ChecklistItemInput = {
	text: string;
	position: number;
};

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
	checklistItems?: ChecklistItemInput[];
};

async function createRecurringTask(data: CreateRecurringTaskInput) {
	const { createdBy, projectId, checklistItems, ...insertData } = data;
	const [task] = await db
		.insert(recurringTaskTable)
		.values({ ...insertData, projectId, createdBy: createdBy ?? null })
		.returning();

	if (!task) {
		throw new Error("Failed to create recurring task");
	}

	if (checklistItems && checklistItems.length > 0) {
		await db.insert(recurringTaskChecklistItemTable).values(
			checklistItems.map((item) => ({
				id: createId(),
				recurringTaskId: task.id,
				text: item.text,
				position: item.position,
			})),
		);
	}

	await publishEvent("recurring_task.created", {
		recurringTaskId: task.id,
		projectId,
		userId: createdBy ?? "",
	});

	return task;
}

export default createRecurringTask;
