import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { templateTable } from "../../database/schema";

async function getTemplate(templateId: string) {
	const template = await db.query.templateTable.findFirst({
		where: eq(templateTable.id, templateId),
		with: {
			columns: {
				orderBy: (fields, { asc }) => [asc(fields.position)],
			},
			tasks: true,
		},
	});

	if (!template) {
		throw new HTTPException(404, { message: "Template not found" });
	}

	return template;
}

export default getTemplate;
