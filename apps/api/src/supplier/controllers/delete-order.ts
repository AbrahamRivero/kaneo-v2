import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { serviceOrderTable } from "../../database/schema";

async function deleteOrder(orderId: string) {
	const [order] = await db
		.delete(serviceOrderTable)
		.where(eq(serviceOrderTable.id, orderId))
		.returning();

	if (!order) {
		throw new HTTPException(404, { message: "Service order not found" });
	}

	return order;
}

export default deleteOrder;
