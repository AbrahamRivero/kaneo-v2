import { client } from "@kaneo/libs";

type CreateContractInput = {
	workspaceId: string;
	title: string;
	description?: string;
	value?: string;
	startDate?: Date;
	endDate?: Date;
	status?: string;
};

async function createContract(supplierId: string, data: CreateContractInput) {
	const response = await client.supplier.supplier[
		":supplierId"
	].contracts.$post({
		param: { supplierId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createContract;
