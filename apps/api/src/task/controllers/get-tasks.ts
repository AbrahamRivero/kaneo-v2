import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { columnRepository } from "../../column/infrastructure/repositories/drizzle-column.repository";
import db from "../../database";
import {
	externalLinkTable,
	labelTable,
	projectTable,
} from "../../database/schema";
import { createTaskUseCases } from "../application";
import type { TaskFilters } from "../domain";

const { getTasks: getTasksUseCase } = createTaskUseCases();

async function getTasks(projectId: string, filters?: TaskFilters) {
	const project = await db.query.projectTable.findFirst({
		where: eq(projectTable.id, projectId),
	});

	if (!project) {
		throw new HTTPException(404, {
			message: "Project not found",
		});
	}

	const result = await getTasksUseCase.execute(projectId, filters);

	const taskIds = result.tasks.map((t) => t.id);

	const labelsData =
		taskIds.length > 0
			? await db
					.select({
						id: labelTable.id,
						name: labelTable.name,
						color: labelTable.color,
						taskId: labelTable.taskId,
					})
					.from(labelTable)
					.where(inArray(labelTable.taskId, taskIds))
			: [];

	const externalLinksData =
		taskIds.length > 0
			? await db
					.select()
					.from(externalLinkTable)
					.where(inArray(externalLinkTable.taskId, taskIds))
			: [];

	const taskLabelsMap = new Map<
		string,
		Array<{ id: string; name: string; color: string }>
	>();
	for (const label of labelsData) {
		if (label.taskId) {
			if (!taskLabelsMap.has(label.taskId)) {
				taskLabelsMap.set(label.taskId, []);
			}
			taskLabelsMap.get(label.taskId)?.push({
				id: label.id,
				name: label.name,
				color: label.color,
			});
		}
	}

	const taskExternalLinksMap = new Map<
		string,
		Array<{
			id: string;
			taskId: string;
			integrationId: string;
			resourceType: string;
			externalId: string;
			url: string;
			title: string | null;
			metadata: Record<string, unknown> | null;
		}>
	>();
	for (const externalLink of externalLinksData) {
		if (!taskExternalLinksMap.has(externalLink.taskId)) {
			taskExternalLinksMap.set(externalLink.taskId, []);
		}
		taskExternalLinksMap.get(externalLink.taskId)?.push({
			...externalLink,
			metadata: externalLink.metadata
				? JSON.parse(externalLink.metadata)
				: null,
		});
	}

	const tasksWithRelations = result.tasks.map((task) => ({
		...task,
		labels: taskLabelsMap.get(task.id) || [],
		externalLinks: taskExternalLinksMap.get(task.id) || [],
	}));

	const projectColumns = await columnRepository.findByProjectId(projectId);

	const columns = projectColumns.map((column) => ({
		id: column.slug,
		slug: column.slug,
		name: column.name,
		isFinal: column.isFinal,
		tasks: tasksWithRelations.filter((task) => task.status === column.slug),
	}));

	const archivedTasks = tasksWithRelations.filter(
		(task) => task.status === "archived",
	);
	const plannedTasks = tasksWithRelations.filter(
		(task) => task.status === "planned",
	);

	const usePagination = filters?.page != null || filters?.limit != null;

	return {
		data: {
			id: project.id,
			name: project.name,
			slug: project.slug,
			icon: project.icon,
			description: project.description,
			isPublic: project.isPublic,
			workspaceId: project.workspaceId,
			archivedAt: project.archivedAt,
			columns,
			archivedTasks,
			plannedTasks,
		},
		pagination: usePagination
			? {
					total: result.total,
					page: result.page,
					pageSize: result.limit,
					totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
				}
			: {
					total: result.total,
					page: 1,
					pageSize: result.total,
					totalPages: 1,
				},
	};
}

export default getTasks;
