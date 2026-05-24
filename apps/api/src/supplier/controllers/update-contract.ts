import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { supplierContractTable } from "../../database/schema";

type UpdateContractInput = {
	title?: string;
	description?: string | null;
	value?: string | null;
	startDate?: Date | null;
	endDate?: Date | null;
	status?: string;
};

async function updateContract(contractId: string, data: UpdateContractInput) {
	const [contract] = await db
		.update(supplierContractTable)
		.set(data)
		.where(eq(supplierContractTable.id, contractId))
		.returning();

	if (!contract) {
		throw new HTTPException(404, { message: "Contract not found" });
	}

	return contract;
}

export default updateContract;
