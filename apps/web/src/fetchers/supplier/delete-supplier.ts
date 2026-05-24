import { client } from "@kaneo/libs";

async function deleteSupplier(supplierId: string) {
	const response = await client.supplier.supplier[":supplierId"].$delete({
		param: { supplierId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default deleteSupplier;
