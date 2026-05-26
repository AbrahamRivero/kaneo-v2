import { client } from "@kaneo/libs";
import type { CheckListItem } from "./list-recurring-tasks";

type CreateChecklistItemRequest = {
	projectId: string;
	recurringTaskId: string;
	text: string;
	position: number;
};

async function createChecklistItem(
	data: CreateChecklistItemRequest,
): Promise<CheckListItem> {
	const { projectId, recurringTaskId, ...body } = data;

	const response = await client["recurring-tasks"][":projectId"][
		":recurringTaskId"
	]["checklist-items"].$post({
		param: { projectId, recurringTaskId },
		json: body,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createChecklistItem;
