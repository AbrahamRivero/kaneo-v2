import { client } from "@kaneo/libs";

export type BudgetWithExpenses = {
	id: string;
	projectId: string;
	totalBudget: string;
	totalSpent: string;
	remaining: string;
	createdAt: string;
	updatedAt: string;
	expenses: {
		id: string;
		budgetId: string;
		description: string;
		amount: string;
		category: string | null;
		incurredAt: string;
		createdAt: string;
		updatedAt: string;
	}[];
};

async function getBudget(projectId: string): Promise<BudgetWithExpenses> {
	const response = await client.budget.project[":projectId"].$get({
		param: { projectId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default getBudget;
