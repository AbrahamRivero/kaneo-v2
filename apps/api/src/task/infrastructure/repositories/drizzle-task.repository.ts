import {
	and,
	asc,
	desc,
	eq,
	gte,
	inArray,
	lte,
	max,
	or,
	sql,
} from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import {
	assetTable,
	columnTable,
	externalLinkTable,
	labelTable,
	projectTable,
	taskRelationTable,
	taskTable,
	userTable,
} from "../../../database/schema";
import { publishEvent } from "../../../events";
import type { TaskRepository } from "../../application/ports/task-repository.port";
import type {
	BulkOperationInput,
	BulkOperationResult,
	CreateTaskInput,
	MoveTaskInput,
	MoveTaskResult,
	Task,
	TaskFilters,
	TaskListResult,
	TaskWithRelations,
	UpdateTaskInput,
} from "../../domain";
import { assertValidTaskStatus } from "../../validate-task-fields";

export class DrizzleTaskRepository implements TaskRepository {
	async findById(id: string): Promise<TaskWithRelations | null> {
		const task = await db.query.taskTable.findFirst({
			where: eq(taskTable.id, id),
		});

		if (!task) {
			return null;
		}

		const labelsData = await db
			.select({
				id: labelTable.id,
				name: labelTable.name,
				color: labelTable.color,
				taskId: labelTable.taskId,
			})
			.from(labelTable)
			.where(eq(labelTable.taskId, id));

		const externalLinksData = await db
			.select()
			.from(externalLinkTable)
			.where(eq(externalLinkTable.taskId, id));

		const assetsData = await db
			.select()
			.from(assetTable)
			.where(eq(assetTable.taskId, id));

		const labels = labelsData.map((l) => ({
			id: l.id,
			name: l.name,
			color: l.color,
		}));

		const externalLinks = externalLinksData.map((link) => ({
			...link,
			metadata: link.metadata ? JSON.parse(link.metadata) : null,
		}));

		const assets = assetsData.map((asset) => ({
			...asset,
			url: `/api/asset/${asset.id}`,
		}));

		const column = task.columnId
			? await db.query.columnTable.findFirst({
					where: eq(columnTable.id, task.columnId),
				})
			: null;

		const assignee = task.userId
			? await db.query.userTable.findFirst({
					where: eq(userTable.id, task.userId),
				})
			: null;

		return {
			...task,
			priority: (task.priority ?? "no-priority") as Task["priority"],
			assigneeName: assignee?.name ?? null,
			assigneeId: task.userId,
			assigneeImage: assignee?.image ?? null,
			columnName: column?.name ?? null,
			labels,
			externalLinks,
			assets,
		};
	}

	async findByProjectId(
		projectId: string,
		filters?: TaskFilters,
	): Promise<TaskListResult> {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, projectId),
		});

		if (!project) {
			throw new HTTPException(404, { message: "Project not found" });
		}

		const conditions = [eq(taskTable.projectId, projectId)];

		if (filters?.status) {
			conditions.push(eq(taskTable.status, filters.status));
		}

		if (filters?.priority) {
			conditions.push(eq(taskTable.priority, filters.priority));
		}

		if (filters?.assigneeId) {
			conditions.push(eq(taskTable.userId, filters.assigneeId));
		}

		if (filters?.dueBefore) {
			conditions.push(lte(taskTable.dueDate, new Date(filters.dueBefore)));
		}

		if (filters?.dueAfter) {
			conditions.push(gte(taskTable.dueDate, new Date(filters.dueAfter)));
		}

		const whereClause = and(...conditions);
		const usePagination = filters?.page != null || filters?.limit != null;
		const page = filters?.page && filters.page > 0 ? filters.page : 1;
		const pageSize =
			filters?.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 50;
		const offset = (page - 1) * pageSize;

		const orderByField = filters?.sortBy ?? "position";
		const orderDirection = filters?.sortOrder ?? "asc";

		const priorityCaseExpr = sql<number>`CASE
      WHEN ${taskTable.priority} = 'urgent' THEN 4
      WHEN ${taskTable.priority} = 'high' THEN 3
      WHEN ${taskTable.priority} = 'medium' THEN 2
      WHEN ${taskTable.priority} = 'low' THEN 1
      ELSE 0
    END`;

		const getOrderBy = () => {
			const direction = orderDirection === "desc" ? desc : asc;
			switch (orderByField) {
				case "createdAt":
					return direction(taskTable.createdAt);
				case "priority":
					return direction(priorityCaseExpr);
				case "dueDate":
					return direction(taskTable.dueDate);
				case "title":
					return direction(taskTable.title);
				case "number":
					return direction(taskTable.number);
				default:
					return direction(taskTable.position);
			}
		};

		const [taskCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(taskTable)
			.where(whereClause);

		const total = Number(taskCount?.count ?? 0);

		const taskSelection = {
			id: taskTable.id,
			title: taskTable.title,
			number: taskTable.number,
			description: taskTable.description,
			status: taskTable.status,
			priority: taskTable.priority,
			startDate: taskTable.startDate,
			dueDate: taskTable.dueDate,
			position: taskTable.position,
			columnId: taskTable.columnId,
			createdAt: taskTable.createdAt,
			updatedAt: taskTable.updatedAt,
			userId: taskTable.userId,
			assigneeName: userTable.name,
			assigneeId: userTable.id,
			assigneeImage: userTable.image,
			projectId: taskTable.projectId,
		};

		const query = db
			.select(taskSelection)
			.from(taskTable)
			.leftJoin(userTable, eq(taskTable.userId, userTable.id))
			.leftJoin(projectTable, eq(taskTable.projectId, projectTable.id))
			.where(whereClause)
			.orderBy(getOrderBy());

		const paginatedTasks = usePagination
			? await query.limit(pageSize).offset(offset)
			: await query;

		const taskIds = paginatedTasks.map((task) => task.id);

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

		return {
			tasks: paginatedTasks.map((task) => ({
				...task,
				columnId: task.columnId,
				priority: (task.priority ?? "no-priority") as Task["priority"],
				updatedAt: task.updatedAt,
				assigneeName: task.assigneeName ?? null,
				labels: taskLabelsMap.get(task.id) || [],
				externalLinks: taskExternalLinksMap.get(task.id) || [],
			})) as TaskWithRelations[],
			total,
			page,
			limit: pageSize,
		};
	}

	async create(input: CreateTaskInput): Promise<TaskWithRelations> {
		const resolvedStatus = input.status || "to-do";
		const resolvedPriority = input.priority || "no-priority";

		await assertValidTaskStatus(resolvedStatus, input.projectId);

		const [assignee] = input.userId
			? await db
					.select({ name: userTable.name })
					.from(userTable)
					.where(eq(userTable.id, input.userId))
			: [null];

		const [lastTask] = await db
			.select({ number: taskTable.number })
			.from(taskTable)
			.where(eq(taskTable.projectId, input.projectId))
			.orderBy(desc(taskTable.number))
			.limit(1);

		const nextTaskNumber = lastTask?.number ?? 0;

		const column = await db.query.columnTable.findFirst({
			where: and(
				eq(columnTable.projectId, input.projectId),
				eq(columnTable.slug, resolvedStatus),
			),
		});

		const [maxPositionResult] = await db
			.select({ maxPosition: max(taskTable.position) })
			.from(taskTable)
			.where(
				and(
					eq(taskTable.projectId, input.projectId),
					column?.id
						? eq(taskTable.columnId, column.id)
						: eq(taskTable.status, resolvedStatus),
				),
			);

		const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;

		const [createdTask] = await db
			.insert(taskTable)
			.values({
				projectId: input.projectId,
				userId: input.userId || null,
				title: input.title || "",
				status: resolvedStatus,
				columnId: column?.id ?? null,
				startDate: input.startDate || null,
				dueDate: input.dueDate || null,
				description: input.description || "",
				priority: resolvedPriority,
				number: nextTaskNumber + 1,
				position: nextPosition,
			})
			.returning();

		if (!createdTask) {
			throw new HTTPException(500, { message: "Failed to create task" });
		}

		return {
			...createdTask,
			priority: (createdTask.priority ?? "no-priority") as Task["priority"],
			assigneeName: assignee?.name ?? null,
		};
	}

	async update(input: UpdateTaskInput): Promise<TaskWithRelations> {
		const [existingTask] = await db
			.select()
			.from(taskTable)
			.where(eq(taskTable.id, input.id))
			.limit(1);

		if (!existingTask) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const [updatedTask] = await db
			.update(taskTable)
			.set({
				...(input.title !== undefined && { title: input.title }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.status !== undefined && { status: input.status }),
				...(input.priority !== undefined && { priority: input.priority }),
				...(input.startDate !== undefined && { startDate: input.startDate }),
				...(input.dueDate !== undefined && { dueDate: input.dueDate }),
				...(input.projectId !== undefined && { projectId: input.projectId }),
				...(input.position !== undefined && { position: input.position }),
				...(input.userId !== undefined && { userId: input.userId }),
			})
			.where(eq(taskTable.id, input.id))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, { message: "Failed to update task" });
		}

		const [assignee] = updatedTask.userId
			? await db
					.select({ name: userTable.name })
					.from(userTable)
					.where(eq(userTable.id, updatedTask.userId))
			: [null];

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
			assigneeName: assignee?.name ?? null,
		};
	}

	async delete(id: string): Promise<TaskWithRelations> {
		const task = await this.findById(id);
		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const relations = await db
			.select()
			.from(taskRelationTable)
			.where(
				or(
					eq(taskRelationTable.sourceTaskId, id),
					eq(taskRelationTable.targetTaskId, id),
				),
			)
			.execute();

		const [deletedTask] = await db
			.delete(taskTable)
			.where(eq(taskTable.id, id))
			.returning()
			.execute();

		if (!deletedTask) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		for (const relation of relations) {
			await publishEvent("task-relation.deleted", {
				projectId: task.projectId,
				userId: "",
				taskId: id,
				sourceTaskId: relation.sourceTaskId,
				targetTaskId: relation.targetTaskId,
			});
		}

		return task;
	}

	async bulkUpdate(input: BulkOperationInput): Promise<BulkOperationResult> {
		let updatedCount = 0;

		for (const taskId of input.taskIds) {
			try {
				switch (input.operation) {
					case "updateStatus":
						if (input.value) {
							await this.updateStatus(taskId, input.value, input.currentUserId);
							updatedCount++;
						}
						break;
					case "updatePriority":
						if (input.value) {
							await this.updatePriority(
								taskId,
								input.value,
								input.currentUserId,
							);
							updatedCount++;
						}
						break;
					case "updateAssignee":
						if (input.value) {
							await this.updateAssignee(
								taskId,
								input.value,
								input.currentUserId,
							);
							updatedCount++;
						}
						break;
					case "delete":
						await this.delete(taskId);
						updatedCount++;
						break;
					case "updateDueDate":
						await this.updateDueDate(
							taskId,
							input.value ? new Date(input.value) : null,
							input.currentUserId,
						);
						updatedCount++;
						break;
				}
			} catch {
				// Skip failed tasks and continue
			}
		}

		return { success: true, updatedCount };
	}

	async move(input: MoveTaskInput): Promise<MoveTaskResult> {
		const [task] = await db
			.select()
			.from(taskTable)
			.where(eq(taskTable.id, input.taskId))
			.limit(1);

		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const sourceProjectId = task.projectId;
		const destinationStatus = input.destinationStatus || task.status;

		const destinationColumn = await db.query.columnTable.findFirst({
			where: and(
				eq(columnTable.projectId, input.destinationProjectId),
				eq(columnTable.slug, destinationStatus),
			),
		});

		const [maxPositionResult] = await db
			.select({ maxPosition: max(taskTable.position) })
			.from(taskTable)
			.where(
				and(
					eq(taskTable.projectId, input.destinationProjectId),
					destinationColumn?.id
						? eq(taskTable.columnId, destinationColumn.id)
						: eq(taskTable.status, destinationStatus),
				),
			);

		const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;

		const [updatedTask] = await db
			.update(taskTable)
			.set({
				projectId: input.destinationProjectId,
				columnId: destinationColumn?.id ?? null,
				status: destinationStatus,
				position: nextPosition,
			})
			.where(eq(taskTable.id, input.taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, { message: "Failed to move task" });
		}

		return {
			task: {
				...updatedTask,
				priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
			},
			sourceProjectId,
			destinationProjectId: input.destinationProjectId,
		};
	}

	async findByIds(ids: string[]): Promise<Task[]> {
		if (ids.length === 0) return [];

		const tasks = await db
			.select()
			.from(taskTable)
			.where(inArray(taskTable.id, ids));

		return tasks.map((task) => ({
			id: task.id,
			projectId: task.projectId,
			userId: task.userId,
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority as Task["priority"],
			startDate: task.startDate,
			dueDate: task.dueDate,
			position: task.position,
			number: task.number,
			columnId: task.columnId,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		}));
	}

	async updateStatus(
		taskId: string,
		status: string,
		_userId: string,
	): Promise<Task> {
		const taskWithRelations = await this.findById(taskId);
		if (!taskWithRelations) {
			throw new HTTPException(404, { message: "Task not found" });
		}
		await assertValidTaskStatus(status, taskWithRelations.projectId);

		const [updatedTask] = await db
			.update(taskTable)
			.set({ status })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, { message: "Failed to update task status" });
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}

	async updatePriority(
		taskId: string,
		priority: string,
		_userId: string,
	): Promise<Task> {
		const [updatedTask] = await db
			.update(taskTable)
			.set({ priority })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, {
				message: "Failed to update task priority",
			});
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}

	async updateAssignee(
		taskId: string,
		userId: string,
		_currentUserId: string,
	): Promise<Task> {
		const [updatedTask] = await db
			.update(taskTable)
			.set({ userId })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, {
				message: "Failed to update task assignee",
			});
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}

	async updateDueDate(
		taskId: string,
		dueDate: Date | null,
		_currentUserId: string,
	): Promise<Task> {
		const [updatedTask] = await db
			.update(taskTable)
			.set({ dueDate })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, {
				message: "Failed to update task due date",
			});
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}

	async updateTitle(
		taskId: string,
		title: string,
		_currentUserId: string,
	): Promise<Task> {
		const [updatedTask] = await db
			.update(taskTable)
			.set({ title })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, { message: "Failed to update task title" });
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}

	async updateDescription(
		taskId: string,
		description: string,
		_currentUserId: string,
	): Promise<Task> {
		const [updatedTask] = await db
			.update(taskTable)
			.set({ description })
			.where(eq(taskTable.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new HTTPException(500, {
				message: "Failed to update task description",
			});
		}

		return {
			...updatedTask,
			priority: (updatedTask.priority ?? "no-priority") as Task["priority"],
		};
	}
}
