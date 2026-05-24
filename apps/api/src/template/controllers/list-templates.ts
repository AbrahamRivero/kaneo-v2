import { eq, isNull, or } from "drizzle-orm";
import db from "../../database";
import { templateTable } from "../../database/schema";

async function listTemplates(workspaceId: string) {
	const templates = await db.query.templateTable.findMany({
		where: or(
			eq(templateTable.workspaceId, workspaceId),
			isNull(templateTable.workspaceId),
		),
		with: {
			columns: {
				orderBy: (fields, { asc }) => [asc(fields.position)],
			},
			tasks: true,
		},
		orderBy: (fields, { asc }) => [asc(fields.name)],
	});

	return templates;
}

export default listTemplates;
