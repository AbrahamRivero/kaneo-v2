import { client } from "@kaneo/libs";

export type WorkspaceBudgetSummary = {
	projectId: string;
	projectName: string;
	projectIcon: string | null;
	totalBudget: string;
	totalSpent: string;
	remaining: string;
};

async function getWorkspaceBudgets(
	workspaceId: string,
): Promise<WorkspaceBudgetSummary[]> {
	const response = await client.budget.workspace[":workspaceId"].$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default getWorkspaceBudgets;
