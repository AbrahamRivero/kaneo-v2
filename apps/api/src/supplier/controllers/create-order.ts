import db from "../../database";
import { serviceOrderTable } from "../../database/schema";

type CreateOrderInput = {
	workspaceId: string;
	supplierId: string;
	contractId?: string;
	projectId?: string;
	title: string;
	description?: string;
	amount?: string;
	status?: string;
	orderedAt?: Date;
};

async function createOrder(data: CreateOrderInput) {
	const [order] = await db.insert(serviceOrderTable).values(data).returning();

	return order;
}

export default createOrder;
