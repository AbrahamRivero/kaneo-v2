import { client } from "@kaneo/libs";

export type ContractSummary = {
	id: string;
	workspaceId: string;
	supplierId: string;
	title: string;
	description: string | null;
	value: string | null;
	startDate: string | null;
	endDate: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
};

export type OrderWithProject = {
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
	project: { id: string; name: string } | null;
};

export type SupplierDetail = {
	id: string;
	workspaceId: string;
	name: string;
	contactName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	website: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	contracts: ContractSummary[];
	serviceOrders: OrderWithProject[];
};

async function getSupplier(supplierId: string): Promise<SupplierDetail> {
	const response = await client.supplier.supplier[":supplierId"].$get({
		param: { supplierId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default getSupplier;
