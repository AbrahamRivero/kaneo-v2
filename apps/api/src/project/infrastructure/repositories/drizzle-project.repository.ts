import { eq, max } from "drizzle-orm";
import { columnRepository } from "../../../column/infrastructure/repositories/drizzle-column.repository";
import db from "../../../database";
import {
	projectTable,
	taskTable,
	templateTable,
} from "../../../database/schema";
import type {
	CreateProjectInput,
	ProjectRepository,
} from "../../application/ports";
import type { Project } from "../../domain";

export const DEFAULT_PROJECT_COLUMNS = [
	{ name: "To Do", slug: "to-do", position: 0, isFinal: false },
	{ name: "In Progress", slug: "in-progress", position: 1, isFinal: false },
	{ name: "In Review", slug: "in-review", position: 2, isFinal: false },
	{ name: "Done", slug: "done", position: 3, isFinal: true },
] as const;

function mapToProject(row: typeof projectTable.$inferSelect): Project {
	return {
		id: row.id,
		workspaceId: row.workspaceId,
		name: row.name,
		slug: row.slug,
		icon: row.icon,
		description: row.description,
		isPublic: row.isPublic ?? false,
		archivedAt: row.archivedAt,
		createdAt: row.createdAt,
	};
}

export class DrizzleProjectRepository implements ProjectRepository {
	async findById(id: string): Promise<Project | null> {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, id),
		});
		return project ? mapToProject(project) : null;
	}

	async findByIdWithTasks(id: string): Promise<Project | null> {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, id),
			with: { tasks: true },
		});
		return project ? mapToProject(project) : null;
	}

	async findByIdAndWorkspace(
		id: string,
		workspaceId: string,
	): Promise<Project | null> {
		const project = await db.query.projectTable.findFirst({
			where: (table, { and, eq }) =>
				and(eq(table.id, id), eq(table.workspaceId, workspaceId)),
		});
		return project ? mapToProject(project) : null;
	}

	async findByWorkspaceId(
		workspaceId: string,
		includeArchived = false,
	): Promise<Project[]> {
		const projects = await db.query.projectTable.findMany({
			where: (table, { and, eq, isNull }) =>
				includeArchived
					? eq(table.workspaceId, workspaceId)
					: and(eq(table.workspaceId, workspaceId), isNull(table.archivedAt)),
			with: { tasks: true },
		});
		return projects.map(mapToProject);
	}

	async create(input: CreateProjectInput): Promise<Project> {
		const [created] = await db
			.insert(projectTable)
			.values({
				workspaceId: input.workspaceId,
				name: input.name,
				icon: input.icon,
				slug: input.slug,
			})
			.returning();

		if (!created) {
			throw new Error("Failed to create project");
		}

		if (input.templateId) {
			const template = await db.query.templateTable.findFirst({
				where: eq(templateTable.id, input.templateId),
				with: {
					columns: {
						orderBy: (cols, { asc }) => [asc(cols.position)],
					},
					tasks: true,
				},
			});

			if (template) {
				const slugToColumnId = new Map<string, string>();

				for (const col of template.columns) {
					const newColumn = await columnRepository.createExplicit(
						created.id,
						col.name,
						col.slug,
						col.position,
						col.isFinal,
					);
					slugToColumnId.set(col.slug, newColumn.id);
				}

				if (template.tasks.length > 0) {
					const [{ max: maxNum }] = await db
						.select({ max: max(taskTable.number) })
						.from(taskTable)
						.where(eq(taskTable.projectId, created.id));

					const nextNumber = (maxNum ?? 0) + 1;

					await db.insert(taskTable).values(
						template.tasks.map((task, i) => ({
							projectId: created.id,
							title: task.title,
							description: task.description,
							columnId: slugToColumnId.get(task.columnSlug) ?? null,
							status: task.columnSlug,
							priority: task.priority === "no-priority" ? "low" : task.priority,
							number: nextNumber + i,
							position: i,
						})),
					);
				}
			} else {
				for (const col of DEFAULT_PROJECT_COLUMNS) {
					await columnRepository.createExplicit(
						created.id,
						col.name,
						col.slug,
						col.position,
						col.isFinal,
					);
				}
			}
		} else {
			for (const col of DEFAULT_PROJECT_COLUMNS) {
				await columnRepository.createExplicit(
					created.id,
					col.name,
					col.slug,
					col.position,
					col.isFinal,
				);
			}
		}

		return mapToProject(created);
	}

	async update(
		id: string,
		input: {
			name?: string;
			icon?: string;
			slug?: string;
			description?: string;
			isPublic?: boolean;
		},
	): Promise<Project> {
		const [updated] = await db
			.update(projectTable)
			.set({
				...(input.name !== undefined && { name: input.name }),
				...(input.icon !== undefined && { icon: input.icon }),
				...(input.slug !== undefined && { slug: input.slug }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.isPublic !== undefined && { isPublic: input.isPublic }),
			})
			.where(eq(projectTable.id, id))
			.returning();

		if (!updated) {
			throw new Error("Failed to update project");
		}

		return mapToProject(updated);
	}

	async delete(id: string): Promise<Project> {
		const existing = await this.findById(id);

		if (!existing) {
			throw new Error("Project not found");
		}

		await db.delete(projectTable).where(eq(projectTable.id, id));

		return existing;
	}

	async archive(id: string): Promise<Project> {
		const [archived] = await db
			.update(projectTable)
			.set({ archivedAt: new Date() })
			.where(eq(projectTable.id, id))
			.returning();

		if (!archived) {
			throw new Error("Failed to archive project");
		}

		return mapToProject(archived);
	}

	async unarchive(id: string): Promise<Project> {
		const [unarchived] = await db
			.update(projectTable)
			.set({ archivedAt: null })
			.where(eq(projectTable.id, id))
			.returning();

		if (!unarchived) {
			throw new Error("Failed to unarchive project");
		}

		return mapToProject(unarchived);
	}
}

export const projectRepository = new DrizzleProjectRepository();
