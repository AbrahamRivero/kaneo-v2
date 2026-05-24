import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { supplierTable } from "../../database/schema";

type UpdateSupplierInput = {
	name?: string;
	contactName?: string | null;
	contactEmail?: string | null;
	contactPhone?: string | null;
	website?: string | null;
	notes?: string | null;
};

async function updateSupplier(supplierId: string, data: UpdateSupplierInput) {
	const [supplier] = await db
		.update(supplierTable)
		.set(data)
		.where(eq(supplierTable.id, supplierId))
		.returning();

	if (!supplier) {
		throw new HTTPException(404, { message: "Supplier not found" });
	}

	return supplier;
}

export default updateSupplier;
