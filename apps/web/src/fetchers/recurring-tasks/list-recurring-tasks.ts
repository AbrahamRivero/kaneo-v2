import { client } from "@kaneo/libs";

export type RecurringTask = {
	id: string;
	projectId: string;
	title: string;
	description: string | null;
	frequency: string;
	intervalValue: number;
	dayOfWeek: number | null;
	dayOfMonth: number | null;
	cronExpression: string | null;
	nextRunAt: string;
	lastRunAt: string | null;
	isActive: boolean;
	columnId: string | null;
	assigneeId: string | null;
	priority: string | null;
	dueDateDaysOffset: number | null;
	labelIds: string[] | null;
	createdAt: string;
	updatedAt: string;
};

async function listRecurringTasks(projectId: string): Promise<RecurringTask[]> {
	const response = await client["recurring-tasks"][":projectId"].$get({
		param: { projectId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listRecurringTasks;
