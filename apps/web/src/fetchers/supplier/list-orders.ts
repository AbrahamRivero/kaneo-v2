import { client } from "@kaneo/libs";

export type OrderWithRelations = {
	id: string;
	workspaceId: string;
	supplierId: string;
	contractId: string | null;
	projectId: string | null;
	title: string;
	description: string | null;
	amount: string | null;
	status: string;
	orderedAt: string | null;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
	supplier: { id: string; name: string };
	contract: { id: string; title: string } | null;
	project: { id: string; name: string } | null;
};

async function listOrders(workspaceId: string): Promise<OrderWithRelations[]> {
	const response = await client.supplier.workspace[":workspaceId"].orders.$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listOrders;
