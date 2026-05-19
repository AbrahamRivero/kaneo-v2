import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { columnRepository } from "../../column/infrastructure/repositories/drizzle-column.repository";
import db from "../../database";
import { projectTable } from "../../database/schema";
import { createTaskUseCases } from "../application";
import type { TaskFilters } from "../domain";

const { getTasks: getTasksUseCase } = createTaskUseCases();

async function getTasks(projectId: string, filters?: TaskFilters) {
	const [project] = await db
		.select({
			id: projectTable.id,
			name: projectTable.name,
			slug: projectTable.slug,
			icon: projectTable.icon,
			description: projectTable.description,
			isPublic: projectTable.isPublic,
			workspaceId: projectTable.workspaceId,
			archivedAt: projectTable.archivedAt,
		})
		.from(projectTable)
		.where(eq(projectTable.id, projectId))
		.limit(1);

	if (!project) {
		throw new HTTPException(404, {
			message: "Project not found",
		});
	}

	const result = await getTasksUseCase.execute(projectId, filters);

	const projectColumns = await columnRepository.findByProjectId(projectId);

	const columns = projectColumns.map((column) => ({
		id: column.slug,
		slug: column.slug,
		name: column.name,
		isFinal: column.isFinal,
		tasks: result.tasks.filter((task) => task.status === column.slug),
	}));

	const archivedTasks = result.tasks.filter(
		(task) => task.status === "archived",
	);
	const plannedTasks = result.tasks.filter((task) => task.status === "planned");

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
