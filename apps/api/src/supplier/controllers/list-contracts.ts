import { eq } from "drizzle-orm";
import db from "../../database";
import { supplierContractTable } from "../../database/schema";

async function listContracts(workspaceId: string) {
	const contracts = await db.query.supplierContractTable.findMany({
		where: eq(supplierContractTable.workspaceId, workspaceId),
		with: {
			supplier: true,
		},
		orderBy: (fields, { desc }) => [desc(fields.createdAt)],
	});

	return contracts;
}

export default listContracts;
