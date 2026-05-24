import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { supplierTable } from "../../database/schema";

async function getSupplier(supplierId: string) {
	const supplier = await db.query.supplierTable.findFirst({
		where: eq(supplierTable.id, supplierId),
		with: {
			contracts: {
				orderBy: (fields, { desc }) => [desc(fields.createdAt)],
			},
			serviceOrders: {
				with: {
					project: true,
				},
				orderBy: (fields, { desc }) => [desc(fields.createdAt)],
			},
		},
	});

	if (!supplier) {
		throw new HTTPException(404, { message: "Supplier not found" });
	}

	return supplier;
}

export default getSupplier;
