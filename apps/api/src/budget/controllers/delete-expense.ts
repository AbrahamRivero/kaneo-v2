import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { budgetExpenseTable } from "../../database/schema";

async function deleteExpense(expenseId: string) {
	const existing = await db.query.budgetExpenseTable.findFirst({
		where: eq(budgetExpenseTable.id, expenseId),
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Expense not found" });
	}

	const [deleted] = await db
		.delete(budgetExpenseTable)
		.where(eq(budgetExpenseTable.id, expenseId))
		.returning();

	return deleted;
}

export default deleteExpense;
