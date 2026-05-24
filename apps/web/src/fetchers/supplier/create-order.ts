import { client } from "@kaneo/libs";

type CreateOrderInput = {
	workspaceId: string;
	title: string;
	description?: string;
	amount?: string;
	contractId?: string;
	projectId?: string;
	status?: string;
	orderedAt?: Date;
};

async function createOrder(supplierId: string, data: CreateOrderInput) {
	const response = await client.supplier.supplier[":supplierId"].orders.$post({
		param: { supplierId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createOrder;
