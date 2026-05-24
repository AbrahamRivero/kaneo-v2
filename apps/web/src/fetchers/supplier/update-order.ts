import { client } from "@kaneo/libs";

type UpdateOrderInput = {
	title?: string;
	description?: string | null;
	amount?: string | null;
	status?: string;
	contractId?: string | null;
	projectId?: string | null;
	orderedAt?: Date | null;
	completedAt?: Date | null;
};

async function updateOrder(
	orderId: string,
	workspaceId: string,
	data: UpdateOrderInput,
) {
	const response = await client.supplier.order[":orderId"].$put({
		param: { orderId },
		query: { workspaceId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default updateOrder;
