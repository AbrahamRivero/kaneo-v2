import { client } from "@kaneo/libs";
import type { CheckListItem } from "./list-recurring-tasks";

async function listChecklistItems(
	projectId: string,
	recurringTaskId: string,
): Promise<CheckListItem[]> {
	const response = await client["recurring-tasks"][":projectId"][
		":recurringTaskId"
	]["checklist-items"].$get({
		param: { projectId, recurringTaskId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listChecklistItems;
