import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { supplierContractTable } from "../../database/schema";

async function deleteContract(contractId: string) {
	const [contract] = await db
		.delete(supplierContractTable)
		.where(eq(supplierContractTable.id, contractId))
		.returning();

	if (!contract) {
		throw new HTTPException(404, { message: "Contract not found" });
	}

	return contract;
}

export default deleteContract;
