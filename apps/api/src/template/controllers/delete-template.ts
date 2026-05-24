import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { templateTable } from "../../database/schema";

async function deleteTemplate(templateId: string) {
	const existing = await db.query.templateTable.findFirst({
		where: eq(templateTable.id, templateId),
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Template not found" });
	}

	await db.delete(templateTable).where(eq(templateTable.id, templateId));

	return { success: true };
}

export default deleteTemplate;
