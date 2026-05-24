import { client } from "@kaneo/libs";

type CreateSupplierInput = {
	name: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	website?: string;
	notes?: string;
};

async function createSupplier(workspaceId: string, data: CreateSupplierInput) {
	const response = await client.supplier.workspace[
		":workspaceId"
	].suppliers.$post({
		param: { workspaceId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createSupplier;
