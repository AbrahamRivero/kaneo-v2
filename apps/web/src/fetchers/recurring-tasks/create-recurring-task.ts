import { client } from "@kaneo/libs";

export type CreateRecurringTaskRequest = {
	projectId: string;
	title: string;
	description?: string;
	frequency?: string;
	intervalValue?: number;
	dayOfWeek?: number;
	dayOfMonth?: number;
	cronExpression?: string;
	nextRunAt: string;
	isActive?: boolean;
	columnId?: string;
	assigneeId?: string;
	priority?: string;
};

async function createRecurringTask(data: CreateRecurringTaskRequest) {
	const { projectId, ...body } = data;

	const response = await client["recurring-tasks"][":projectId"].$post({
		param: { projectId },
		json: body,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createRecurringTask;
