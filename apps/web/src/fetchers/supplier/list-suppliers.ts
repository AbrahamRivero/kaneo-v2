import { client } from "@kaneo/libs";

export type SupplierSummary = {
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
	contractCount: number;
	orderCount: number;
};

async function listSuppliers(workspaceId: string): Promise<SupplierSummary[]> {
	const response = await client.supplier.workspace[
		":workspaceId"
	].suppliers.$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listSuppliers;
