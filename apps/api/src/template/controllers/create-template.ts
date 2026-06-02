import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
	templateColumnTable,
	templateTable,
	templateTaskTable,
} from "../../database/schema";

type CreateTemplateInput = {
	workspaceId: string;
	name: string;
	description?: string;
	icon?: string;
	columns: {
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

async function createTemplate(input: CreateTemplateInput) {
	const templateId = createId();

	const [template] = await db
		.insert(templateTable)
		.values({
			id: templateId,
			workspaceId: input.workspaceId,
			name: input.name,
			description: input.description ?? null,
			icon: input.icon ?? "Layout",
		})
		.returning();

	if (!template) {
		throw new HTTPException(500, { message: "Failed to create template" });
	}

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

	if (input.tasks && input.tasks.length > 0) {
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

	return getTemplate(templateId);
}

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

	return template;
}

export default createTemplate;
