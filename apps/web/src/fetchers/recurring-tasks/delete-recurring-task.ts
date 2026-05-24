import { client } from "@kaneo/libs";

async function deleteRecurringTask(recurringTaskId: string, projectId: string) {
	const response = await client["recurring-tasks"][":projectId"][
		":recurringTaskId"
	].$delete({
		param: { projectId, recurringTaskId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteRecurringTask;
