import { eq } from "drizzle-orm";
import db from "../../database";
import { budgetTable } from "../../database/schema";

async function setBudget(projectId: string, totalBudget: string) {
	const existing = await db.query.budgetTable.findFirst({
		where: eq(budgetTable.projectId, projectId),
	});

	if (existing) {
		const [updated] = await db
			.update(budgetTable)
			.set({ totalBudget })
			.where(eq(budgetTable.id, existing.id))
			.returning();

		return updated;
	}

	const [created] = await db
		.insert(budgetTable)
		.values({ projectId, totalBudget })
		.returning();

	return created;
}

export default setBudget;
