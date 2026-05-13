import { and, asc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { columnTable, taskTable } from "../../../database/schema";
import type {
	ColumnRepository,
	CreateColumnInput,
	ReorderColumnInput,
	UpdateColumnInput,
} from "../../application/ports";
import type { Column, ColumnWithTaskCount } from "../../domain";

function mapToColumn(row: typeof columnTable.$inferSelect): Column {
	return {
		id: row.id,
		projectId: row.projectId,
		name: row.name,
		slug: row.slug,
		position: row.position,
		icon: row.icon,
		color: row.color,
		isFinal: row.isFinal,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export class DrizzleColumnRepository implements ColumnRepository {
	async findById(id: string): Promise<Column | null> {
		const column = await db.query.columnTable.findFirst({
			where: eq(columnTable.id, id),
		});
		return column ? mapToColumn(column) : null;
	}

	async findByProjectId(projectId: string): Promise<Column[]> {
		const columns = await db.query.columnTable.findMany({
			where: eq(columnTable.projectId, projectId),
			orderBy: asc(columnTable.position),
		});
		return columns.map(mapToColumn);
	}

	async findByIdWithTaskCount(id: string): Promise<ColumnWithTaskCount | null> {
		const column = await db.query.columnTable.findFirst({
			where: eq(columnTable.id, id),
		});

		if (!column) return null;

		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(taskTable)
			.where(eq(taskTable.columnId, id));

		return {
			...mapToColumn(column),
			taskCount: count,
		};
	}

	async create(input: CreateColumnInput): Promise<Column> {
		const slug = toSlug(input.name);
		const maxPosition = await this.findMaxPosition(input.projectId);
		const position = maxPosition + 1;

		const [created] = await db
			.insert(columnTable)
			.values({
				projectId: input.projectId,
				name: input.name,
				slug,
				position,
				icon: input.icon || null,
				color: input.color || null,
				isFinal: input.isFinal ?? false,
			})
			.returning();

		if (!created) {
			throw new HTTPException(500, { message: "Failed to create column" });
		}

		return mapToColumn(created);
	}

	async createExplicit(
		projectId: string,
		name: string,
		slug: string,
		position: number,
		isFinal: boolean,
	): Promise<Column> {
		const [created] = await db
			.insert(columnTable)
			.values({
				projectId,
				name,
				slug,
				position,
				isFinal,
			})
			.returning();

		if (!created) {
			throw new HTTPException(500, { message: "Failed to create column" });
		}

		return mapToColumn(created);
	}

	async update(id: string, input: UpdateColumnInput): Promise<Column> {
		const [updated] = await db
			.update(columnTable)
			.set({
				...(input.name !== undefined && { name: input.name }),
				...(input.icon !== undefined && { icon: input.icon }),
				...(input.color !== undefined && { color: input.color }),
				...(input.isFinal !== undefined && { isFinal: input.isFinal }),
			})
			.where(eq(columnTable.id, id))
			.returning();

		if (!updated) {
			throw new HTTPException(500, { message: "Failed to update column" });
		}

		return mapToColumn(updated);
	}

	async delete(id: string): Promise<Column> {
		const existing = await db.query.columnTable.findFirst({
			where: eq(columnTable.id, id),
		});

		if (!existing) {
			throw new HTTPException(404, { message: "Column not found" });
		}

		await db.delete(columnTable).where(eq(columnTable.id, id));

		return mapToColumn(existing);
	}

	async reorder(
		projectId: string,
		columns: ReorderColumnInput[],
	): Promise<Column[]> {
		for (const col of columns) {
			const [updated] = await db
				.update(columnTable)
				.set({ position: col.position })
				.where(
					and(eq(columnTable.id, col.id), eq(columnTable.projectId, projectId)),
				)
				.returning({ id: columnTable.id });

			if (!updated) {
				throw new HTTPException(400, {
					message: `Column ${col.id} does not belong to this project`,
				});
			}
		}

		return this.findByProjectId(projectId);
	}

	async existsBySlug(projectId: string, slug: string): Promise<boolean> {
		const [result] = await db
			.select({ id: columnTable.id })
			.from(columnTable)
			.where(
				sql`${columnTable.projectId} = ${projectId} AND ${columnTable.slug} = ${slug}`,
			);
		return !!result;
	}

	async findMaxPosition(projectId: string): Promise<number> {
		const [maxPos] = await db
			.select({
				maxPosition: sql<number>`COALESCE(MAX(${columnTable.position}), -1)`,
			})
			.from(columnTable)
			.where(eq(columnTable.projectId, projectId));

		return maxPos?.maxPosition ?? -1;
	}
}

export const columnRepository = new DrizzleColumnRepository();
