import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { budgetExpenseTable, budgetTable } from "../../database/schema";

async function createExpense(
	budgetId: string,
	data: {
		description: string;
		amount: string;
		category?: string;
		incurredAt?: Date;
	},
) {
	const budget = await db.query.budgetTable.findFirst({
		where: eq(budgetTable.id, budgetId),
	});

	if (!budget) {
		throw new HTTPException(404, { message: "Budget not found" });
	}

	const [expense] = await db
		.insert(budgetExpenseTable)
		.values({
			budgetId,
			description: data.description,
			amount: data.amount,
			category: data.category ?? null,
			incurredAt: data.incurredAt ?? new Date(),
		})
		.returning();

	return expense;
}

export default createExpense;
