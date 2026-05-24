import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
	templateColumnTable,
	templateTable,
	templateTaskTable,
} from "../../database/schema";

type UpdateTemplateInput = {
	name?: string;
	description?: string | null;
	icon?: string;
	columns?: {
		name: string;
		slug: string;
		position: number;
		color?: string;
		isFinal?: boolean;
	}[];
	tasks?: {
		title: string;
		description?: string;
		columnSlug: string;
		priority?: string;
	}[];
};

async function updateTemplate(templateId: string, input: UpdateTemplateInput) {
	const existing = await db.query.templateTable.findFirst({
		where: eq(templateTable.id, templateId),
	});

	if (!existing) {
		throw new HTTPException(404, { message: "Template not found" });
	}

	await db
		.update(templateTable)
		.set({
			...(input.name !== undefined && { name: input.name }),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.icon !== undefined && { icon: input.icon }),
		})
		.where(eq(templateTable.id, templateId));

	if (input.columns !== undefined) {
		await db
			.delete(templateColumnTable)
			.where(eq(templateColumnTable.templateId, templateId));

		if (input.columns.length > 0) {
			await db.insert(templateColumnTable).values(
				input.columns.map((col) => ({
					templateId,
					name: col.name,
					slug: col.slug,
					position: col.position,
					color: col.color ?? null,
					isFinal: col.isFinal ?? false,
				})),
			);
		}
	}

	if (input.tasks !== undefined) {
		await db
			.delete(templateTaskTable)
			.where(eq(templateTaskTable.templateId, templateId));

		if (input.tasks.length > 0) {
			await db.insert(templateTaskTable).values(
				input.tasks.map((task) => ({
					templateId,
					title: task.title,
					description: task.description ?? null,
					columnSlug: task.columnSlug,
					priority: task.priority ?? "no-priority",
				})),
			);
		}
	}

	const template = await db.query.templateTable.findFirst({
		where: eq(templateTable.id, templateId),
		with: {
			columns: {
				orderBy: (fields, { asc }) => [asc(fields.position)],
			},
			tasks: true,
		},
	});

	return template;
}

export default updateTemplate;
