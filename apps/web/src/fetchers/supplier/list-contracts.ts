import { client } from "@kaneo/libs";

export type ContractWithSupplier = {
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
	supplier: { id: string; name: string };
};

async function listContracts(
	workspaceId: string,
): Promise<ContractWithSupplier[]> {
	const response = await client.supplier.workspace[
		":workspaceId"
	].contracts.$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listContracts;
