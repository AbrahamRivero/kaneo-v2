import { client } from "@kaneo/libs";

async function deleteContract(contractId: string, workspaceId: string) {
	const response = await client.supplier.contract[":contractId"].$delete({
		param: { contractId },
		query: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteContract;
