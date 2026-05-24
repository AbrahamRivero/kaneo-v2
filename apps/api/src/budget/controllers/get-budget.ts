import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
	budgetExpenseTable,
	budgetTable,
	projectTable,
} from "../../database/schema";

async function getBudget(projectId: string) {
	let budget = await db.query.budgetTable.findFirst({
		where: eq(budgetTable.projectId, projectId),
	});

	if (!budget) {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, projectId),
		});

		if (!project) {
			throw new HTTPException(404, { message: "Project not found" });
		}

		[budget] = await db.insert(budgetTable).values({ projectId }).returning();
	}

	const expenses = await db.query.budgetExpenseTable.findMany({
		where: eq(budgetExpenseTable.budgetId, budget.id),
		orderBy: (fields, { desc }) => [desc(fields.incurredAt)],
	});

	const totalSpent = expenses.reduce(
		(sum, e) => sum + Number.parseFloat(e.amount),
		0,
	);

	return {
		...budget,
		expenses,
		totalSpent: totalSpent.toFixed(2),
		remaining: (Number.parseFloat(budget.totalBudget) - totalSpent).toFixed(2),
	};
}

export default getBudget;
