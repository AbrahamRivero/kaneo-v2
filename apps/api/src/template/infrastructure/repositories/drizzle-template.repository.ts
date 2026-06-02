import { createId } from "@paralleldrive/cuid2";
import { eq, isNull, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import {
	templateColumnTable,
	templateTable,
	templateTaskTable,
} from "../../../database/schema";
import type { TemplateRepository } from "../../application/ports/template-repository.port";
import type {
	CreateTemplateInput,
	TemplateWithRelations,
	UpdateTemplateInput,
} from "../../domain";
import { mapTemplateWithRelations } from "../mappers/template.mapper";

function getTemplateWithRelations(id: string) {
	return db.query.templateTable.findFirst({
		where: eq(templateTable.id, id),
		with: {
			columns: {
				orderBy: (fields, { asc }) => [asc(fields.position)],
			},
			tasks: true,
		},
	});
}

function assertTemplateFound(
	result: Awaited<ReturnType<typeof getTemplateWithRelations>>,
) {
	if (!result) {
		throw new HTTPException(500, {
			message: "Template not found after operation",
		});
	}
	return {
		template: result,
		columns: result.columns,
		tasks: result.tasks,
	};
}

export class DrizzleTemplateRepository implements TemplateRepository {
	async findById(id: string): Promise<TemplateWithRelations | null> {
		const row = await getTemplateWithRelations(id);
		if (!row) return null;

		return mapTemplateWithRelations({
			template: row,
			columns: row.columns,
			tasks: row.tasks,
		});
	}

	async findByWorkspaceId(
		workspaceId: string,
	): Promise<TemplateWithRelations[]> {
		const rows = await db.query.templateTable.findMany({
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

		return rows.map((row) =>
			mapTemplateWithRelations({
				template: row,
				columns: row.columns,
				tasks: row.tasks,
			}),
		);
	}

	async create(
		input: CreateTemplateInput & { id: string },
	): Promise<TemplateWithRelations> {
		await db.insert(templateTable).values({
			id: input.id,
			workspaceId: input.workspaceId,
			name: input.name,
			description: input.description ?? null,
			icon: input.icon ?? "Layout",
		});

		if (input.columns.length > 0) {
			await db.insert(templateColumnTable).values(
				input.columns.map((col) => ({
					id: createId(),
					templateId: input.id,
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
					id: createId(),
					templateId: input.id,
					title: task.title,
					description: task.description ?? null,
					columnSlug: task.columnSlug,
					priority: task.priority ?? "no-priority",
				})),
			);
		}

		const result = assertTemplateFound(
			await getTemplateWithRelations(input.id),
		);
		return mapTemplateWithRelations(result);
	}

	async update(
		id: string,
		input: UpdateTemplateInput,
	): Promise<TemplateWithRelations> {
		await db
			.update(templateTable)
			.set({
				...(input.name !== undefined && { name: input.name }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.icon !== undefined && { icon: input.icon }),
			})
			.where(eq(templateTable.id, id));

		if (input.columns !== undefined) {
			await db
				.delete(templateColumnTable)
				.where(eq(templateColumnTable.templateId, id));

			if (input.columns.length > 0) {
				await db.insert(templateColumnTable).values(
					input.columns.map((col) => ({
						id: createId(),
						templateId: id,
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
				.where(eq(templateTaskTable.templateId, id));

			if (input.tasks.length > 0) {
				await db.insert(templateTaskTable).values(
					input.tasks.map((task) => ({
						id: createId(),
						templateId: id,
						title: task.title,
						description: task.description ?? null,
						columnSlug: task.columnSlug,
						priority: task.priority ?? "no-priority",
					})),
				);
			}
		}

		const result = assertTemplateFound(await getTemplateWithRelations(id));
		return mapTemplateWithRelations(result);
	}

	async delete(id: string): Promise<void> {
		await db.delete(templateTable).where(eq(templateTable.id, id));
	}
}

export const templateRepository = new DrizzleTemplateRepository();
