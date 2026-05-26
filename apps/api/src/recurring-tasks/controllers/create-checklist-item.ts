import { createId } from "@paralleldrive/cuid2";
import db from "../../database";
import { recurringTaskChecklistItemTable } from "../../database/schema";

type CreateChecklistItemInput = {
	recurringTaskId: string;
	text: string;
	position: number;
};

async function createChecklistItem(data: CreateChecklistItemInput) {
	const [item] = await db
		.insert(recurringTaskChecklistItemTable)
		.values({
			id: createId(),
			recurringTaskId: data.recurringTaskId,
			text: data.text,
			position: data.position,
		})
		.returning();

	return item;
}

export default createChecklistItem;
