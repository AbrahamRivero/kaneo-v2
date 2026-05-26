import { client } from "@kaneo/libs";

import type { CheckListItemInput } from "./create-recurring-task";

export type UpdateRecurringTaskRequest = {
	projectId: string;
	recurringTaskId: string;
	title?: string;
	description?: string | null;
	frequency?: string;
	intervalValue?: number;
	dayOfWeek?: number | null;
	dayOfMonth?: number | null;
	cronExpression?: string | null;
	nextRunAt?: string;
	isActive?: boolean;
	columnId?: string | null;
	assigneeId?: string | null;
	priority?: string | null;
	dueDateDaysOffset?: number | null;
	labelIds?: string[] | null;
	checklistItems?: CheckListItemInput[];
};

async function updateRecurringTask(data: UpdateRecurringTaskRequest) {
	const { projectId, recurringTaskId, ...body } = data;

	const response = await client["recurring-tasks"][":projectId"][
		":recurringTaskId"
	].$put({
		param: { projectId, recurringTaskId },
		json: body,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default updateRecurringTask;
