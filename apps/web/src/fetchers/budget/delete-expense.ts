import { client } from "@kaneo/libs";

export type DeleteExpenseRequest = {
	expenseId: string;
};

async function deleteExpense({ expenseId }: DeleteExpenseRequest) {
	const response = await client.budget.expense[":expenseId"].$delete({
		param: { expenseId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteExpense;
