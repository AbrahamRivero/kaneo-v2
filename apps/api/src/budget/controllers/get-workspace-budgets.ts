import { eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
	budgetExpenseTable,
	budgetTable,
	projectTable,
} from "../../database/schema";

async function getWorkspaceBudgets(workspaceId: string) {
	const projects = await db.query.projectTable.findMany({
		where: eq(projectTable.workspaceId, workspaceId),
		columns: { id: true, name: true, icon: true },
	});

	const projectIds = projects.map((p) => p.id);

	if (projectIds.length === 0) {
		return [];
	}

	const budgets = await db.query.budgetTable.findMany({
		where: inArray(budgetTable.projectId, projectIds),
	});

	const budgetIds = budgets.map((b) => b.id);

	const expenses =
		budgetIds.length > 0
			? await db.query.budgetExpenseTable.findMany({
					where: inArray(budgetExpenseTable.budgetId, budgetIds),
				})
			: [];

	return projects.map((project) => {
		const budget = budgets.find((b) => b.projectId === project.id);
		const projectExpenses = budget
			? expenses.filter((e) => e.budgetId === budget.id)
			: [];
		const totalSpent = projectExpenses.reduce(
			(sum, e) => sum + Number.parseFloat(e.amount),
			0,
		);

		return {
			projectId: project.id,
			projectName: project.name,
			projectIcon: project.icon,
			totalBudget: budget?.totalBudget ?? "0",
			totalSpent: totalSpent.toFixed(2),
			remaining: (
				Number.parseFloat(budget?.totalBudget ?? "0") - totalSpent
			).toFixed(2),
		};
	});
}

export default getWorkspaceBudgets;
