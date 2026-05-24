import { client } from "@kaneo/libs";

async function deleteOrder(orderId: string, workspaceId: string) {
	const response = await client.supplier.order[":orderId"].$delete({
		param: { orderId },
		query: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteOrder;
