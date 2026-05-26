import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { recurringTaskChecklistItemTable } from "../../database/schema";

async function deleteChecklistItem(checklistItemId: string) {
	const [item] = await db
		.delete(recurringTaskChecklistItemTable)
		.where(eq(recurringTaskChecklistItemTable.id, checklistItemId))
		.returning();

	if (!item) {
		throw new HTTPException(404, {
			message: "Checklist item not found",
		});
	}

	return item;
}

export default deleteChecklistItem;
