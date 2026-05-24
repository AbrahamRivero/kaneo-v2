import db from "../../database";
import { supplierTable } from "../../database/schema";

type CreateSupplierInput = {
	workspaceId: string;
	name: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	website?: string;
	notes?: string;
};

async function createSupplier(data: CreateSupplierInput) {
	const [supplier] = await db.insert(supplierTable).values(data).returning();

	return supplier;
}

export default createSupplier;
