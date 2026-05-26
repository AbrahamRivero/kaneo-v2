import { client } from "@kaneo/libs";
import type { CheckListItem } from "./list-recurring-tasks";

async function deleteChecklistItem(
	projectId: string,
	recurringTaskId: string,
	checklistItemId: string,
): Promise<CheckListItem> {
	const response = await client["recurring-tasks"][":projectId"][
		":recurringTaskId"
	]["checklist-items"][":checklistItemId"].$delete({
		param: { projectId, recurringTaskId, checklistItemId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteChecklistItem;
