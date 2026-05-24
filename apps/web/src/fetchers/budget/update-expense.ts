import { client } from "@kaneo/libs";

export type UpdateExpenseRequest = {
	expenseId: string;
	description?: string;
	amount?: string;
	category?: string | null;
	incurredAt?: string;
};

async function updateExpense({
	expenseId,
	description,
	amount,
	category,
	incurredAt,
}: UpdateExpenseRequest) {
	const response = await client.budget.expense[":expenseId"].$put({
		param: { expenseId },
		json: {
			...(description !== undefined && { description }),
			...(amount !== undefined && { amount }),
			...(category !== undefined && { category }),
			...(incurredAt !== undefined && { incurredAt: new Date(incurredAt) }),
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default updateExpense;
