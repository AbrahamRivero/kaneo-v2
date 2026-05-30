import { and, eq, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { labelTable, projectTable, taskTable } from "../../../database/schema";
import type { LabelRepository } from "../../application/ports/label-repository.port";
import type {
	CreateLabelInput,
	Label,
	LabelWithRelations,
	UpdateLabelInput,
} from "../../domain";
import { mapLabelToEntity } from "../mappers/label.mapper";

export class DrizzleLabelRepository implements LabelRepository {
	async findById(id: string): Promise<Label | null> {
		const label = await db.query.labelTable.findFirst({
			where: eq(labelTable.id, id),
		});
		return label ? mapLabelToEntity(label) : null;
	}

	async findByWorkspaceId(workspaceId: string): Promise<Label[]> {
		const labels = await db
			.select()
			.from(labelTable)
			.where(eq(labelTable.workspaceId, workspaceId));
		return labels.map(mapLabelToEntity);
	}

	async findByTaskId(taskId: string): Promise<Label[]> {
		const labels = await db.query.labelTable.findMany({
			where: eq(labelTable.taskId, taskId),
		});
		return labels.map(mapLabelToEntity);
	}

	async create(input: CreateLabelInput): Promise<LabelWithRelations> {
		if (input.taskId) {
			const [task] = await db
				.select({
					id: taskTable.id,
					projectId: taskTable.projectId,
					workspaceId: projectTable.workspaceId,
				})
				.from(taskTable)
				.innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
				.where(eq(taskTable.id, input.taskId))
				.limit(1);

			if (!task) {
				throw new HTTPException(404, { message: "Task not found" });
			}

			const [inserted] = await db
				.insert(labelTable)
				.values({
					name: input.name,
					color: input.color,
					taskId: input.taskId,
					workspaceId: task.workspaceId,
				})
				.onConflictDoNothing({
					target: [labelTable.taskId, labelTable.name],
				})
				.returning();

			const label =
				inserted ??
				(await db.query.labelTable.findFirst({
					where: and(
						eq(labelTable.taskId, input.taskId),
						eq(labelTable.name, input.name),
					),
				}));

			if (!label) {
				throw new HTTPException(500, {
					message: "Failed to create or resolve label",
				});
			}

			return {
				...mapLabelToEntity(label),
				task: {
					id: task.id,
					projectId: task.projectId,
					workspaceId: task.workspaceId,
				},
			};
		}

		const [inserted] = await db
			.insert(labelTable)
			.values({
				name: input.name,
				color: input.color,
				taskId: null,
				workspaceId: input.workspaceId,
			})
			.onConflictDoNothing({
				target: [labelTable.workspaceId, labelTable.name],
				where: isNull(labelTable.taskId),
			})
			.returning();

		const label =
			inserted ??
			(await db.query.labelTable.findFirst({
				where: and(
					eq(labelTable.workspaceId, input.workspaceId),
					eq(labelTable.name, input.name),
					isNull(labelTable.taskId),
				),
			}));

		if (!label) {
			throw new HTTPException(500, {
				message: "Failed to create or resolve label",
			});
		}

		return {
			...mapLabelToEntity(label),
			task: null,
		};
	}

	async update(input: UpdateLabelInput): Promise<Label[]> {
		const [updatedLabel] = await db
			.update(labelTable)
			.set({ name: input.name, color: input.color })
			.where(eq(labelTable.id, input.id))
			.returning();
		return [mapLabelToEntity(updatedLabel)];
	}

	async delete(id: string): Promise<Label> {
		const [deletedLabel] = await db
			.delete(labelTable)
			.where(eq(labelTable.id, id))
			.returning();
		if (!deletedLabel) {
			throw new HTTPException(404, { message: "Label not found" });
		}
		return mapLabelToEntity(deletedLabel);
	}

	async assignToTask(labelId: string, taskId: string): Promise<Label> {
		const [updatedLabel] = await db
			.update(labelTable)
			.set({ taskId })
			.where(eq(labelTable.id, labelId))
			.returning();
		if (!updatedLabel) {
			throw new HTTPException(500, {
				message: "Failed to attach label to task",
			});
		}
		return mapLabelToEntity(updatedLabel);
	}

	async unassignFromTask(labelId: string): Promise<Label> {
		const [updatedLabel] = await db
			.update(labelTable)
			.set({ taskId: null })
			.where(eq(labelTable.id, labelId))
			.returning();
		if (!updatedLabel) {
			throw new HTTPException(500, {
				message: "Failed to detach label from task",
			});
		}
		return mapLabelToEntity(updatedLabel);
	}

	async findTaskById(taskId: string): Promise<{
		id: string;
		projectId: string;
		workspaceId: string;
	} | null> {
		const [task] = await db
			.select({
				id: taskTable.id,
				projectId: taskTable.projectId,
				workspaceId: projectTable.workspaceId,
			})
			.from(taskTable)
			.innerJoin(projectTable, eq(taskTable.projectId, projectTable.id))
			.where(eq(taskTable.id, taskId))
			.limit(1);
		return task ?? null;
	}
}
