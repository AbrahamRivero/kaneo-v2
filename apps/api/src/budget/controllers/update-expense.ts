import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { budgetExpenseTable } from "../../database/schema";

async function updateExpense(
	expenseId: string,
	data: {
		description?: string;
		amount?: string;
		category?: string | null;
		incurredAt?: Date;
	},
) {
	const existing = await db.query.budgetExpenseTable.findFirst({
		where: eq(budgetExpenseTable.id, expenseId),
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Expense not found" });
	}

	const [updated] = await db
		.update(budgetExpenseTable)
		.set({
			...(data.description !== undefined && { description: data.description }),
			...(data.amount !== undefined && { amount: data.amount }),
			...(data.category !== undefined && { category: data.category }),
			...(data.incurredAt !== undefined && { incurredAt: data.incurredAt }),
		})
		.where(eq(budgetExpenseTable.id, expenseId))
		.returning();

	return updated;
}

export default updateExpense;
