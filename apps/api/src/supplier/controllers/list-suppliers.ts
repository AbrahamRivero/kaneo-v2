import { eq } from "drizzle-orm";
import db from "../../database";
import { supplierTable } from "../../database/schema";

async function listSuppliers(workspaceId: string) {
	const suppliers = await db.query.supplierTable.findMany({
		where: eq(supplierTable.workspaceId, workspaceId),
		with: {
			contracts: true,
			serviceOrders: true,
		},
		orderBy: (fields, { asc }) => [asc(fields.name)],
	});

	return suppliers.map((s) => ({
		...s,
		contractCount: s.contracts.length,
		orderCount: s.serviceOrders.length,
		contracts: undefined,
		serviceOrders: undefined,
	}));
}

export default listSuppliers;
