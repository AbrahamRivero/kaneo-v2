import { client } from "@kaneo/libs";

export type SetBudgetRequest = {
	projectId: string;
	totalBudget: string;
};

async function setBudget({ projectId, totalBudget }: SetBudgetRequest) {
	const response = await client.budget.project[":projectId"].$put({
		param: { projectId },
		json: { totalBudget },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default setBudget;
