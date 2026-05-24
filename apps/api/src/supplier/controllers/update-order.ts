import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { serviceOrderTable } from "../../database/schema";

type UpdateOrderInput = {
	title?: string;
	description?: string | null;
	amount?: string | null;
	status?: string;
	contractId?: string | null;
	projectId?: string | null;
	orderedAt?: Date | null;
	completedAt?: Date | null;
};

async function updateOrder(orderId: string, data: UpdateOrderInput) {
	const [order] = await db
		.update(serviceOrderTable)
		.set(data)
		.where(eq(serviceOrderTable.id, orderId))
		.returning();

	if (!order) {
		throw new HTTPException(404, { message: "Service order not found" });
	}

	return order;
}

export default updateOrder;
