import { client } from "@kaneo/libs";

type UpdateContractInput = {
	title?: string;
	description?: string | null;
	value?: string | null;
	startDate?: Date | null;
	endDate?: Date | null;
	status?: string;
};

async function updateContract(
	contractId: string,
	workspaceId: string,
	data: UpdateContractInput,
) {
	const response = await client.supplier.contract[":contractId"].$put({
		param: { contractId },
		query: { workspaceId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default updateContract;
