import { client } from "@kaneo/libs";

export type CreateExpenseRequest = {
	budgetId: string;
	description: string;
	amount: string;
	category?: string;
	incurredAt?: string;
};

async function createExpense({
	budgetId,
	description,
	amount,
	category,
	incurredAt,
}: CreateExpenseRequest) {
	const response = await client.budget[":budgetId"].expense.$post({
		param: { budgetId },
		json: {
			description,
			amount,
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

export default createExpense;
