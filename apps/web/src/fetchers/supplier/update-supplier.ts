import { client } from "@kaneo/libs";

type UpdateSupplierInput = {
	name?: string;
	contactName?: string | null;
	contactEmail?: string | null;
	contactPhone?: string | null;
	website?: string | null;
	notes?: string | null;
};

async function updateSupplier(supplierId: string, data: UpdateSupplierInput) {
	const response = await client.supplier.supplier[":supplierId"].$put({
		param: { supplierId },
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default updateSupplier;
