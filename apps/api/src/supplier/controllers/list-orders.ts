import { eq } from "drizzle-orm";
import db from "../../database";
import { serviceOrderTable } from "../../database/schema";

async function listOrders(workspaceId: string) {
	const orders = await db.query.serviceOrderTable.findMany({
		where: eq(serviceOrderTable.workspaceId, workspaceId),
		with: {
			supplier: true,
			contract: true,
			project: true,
		},
		orderBy: (fields, { desc }) => [desc(fields.createdAt)],
	});

	return orders;
}

export default listOrders;
