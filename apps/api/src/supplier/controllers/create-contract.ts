import db from "../../database";
import { supplierContractTable } from "../../database/schema";

type CreateContractInput = {
	workspaceId: string;
	supplierId: string;
	title: string;
	description?: string;
	value?: string;
	startDate?: Date;
	endDate?: Date;
	status?: string;
};

async function createContract(data: CreateContractInput) {
	const [contract] = await db
		.insert(supplierContractTable)
		.values(data)
		.returning();

	return contract;
}

export default createContract;
