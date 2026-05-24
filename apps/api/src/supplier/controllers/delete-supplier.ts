import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { supplierTable } from "../../database/schema";

async function deleteSupplier(supplierId: string) {
	const [supplier] = await db
		.delete(supplierTable)
		.where(eq(supplierTable.id, supplierId))
		.returning();

	if (!supplier) {
		throw new HTTPException(404, { message: "Supplier not found" });
	}

	return supplier;
}

export default deleteSupplier;
