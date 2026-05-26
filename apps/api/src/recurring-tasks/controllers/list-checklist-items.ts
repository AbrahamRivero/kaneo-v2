import { eq } from "drizzle-orm";
import db from "../../database";
import { recurringTaskChecklistItemTable } from "../../database/schema";

async function listChecklistItems(recurringTaskId: string) {
	return db
		.select()
		.from(recurringTaskChecklistItemTable)
		.where(eq(recurringTaskChecklistItemTable.recurringTaskId, recurringTaskId))
		.orderBy(recurringTaskChecklistItemTable.position);
}

export default listChecklistItems;
