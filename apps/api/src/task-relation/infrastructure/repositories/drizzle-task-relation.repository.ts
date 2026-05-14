import { and, eq, or } from "drizzle-orm";
import db from "../../../database";
import {
	taskRelationTable,
	taskTable,
	userTable,
} from "../../../database/schema";
import type { TaskRelationRepository } from "../../application/ports";
import type { TaskRelation, TaskRelationWithTasks } from "../../domain";
import {
	mapToTaskRelation,
	mapToTaskRelationWithTasks,
} from "../mappers/task-relation.mapper";

export class DrizzleTaskRelationRepository implements TaskRelationRepository {
	async findByTaskId(taskId: string): Promise<TaskRelationWithTasks[]> {
		const sourceAlias = db.select().from(taskTable).as("source");
		const targetAlias = db.select().from(taskTable).as("target");
		const sourceUserAlias = db.select().from(userTable).as("source_user");
		const targetUserAlias = db.select().from(userTable).as("target_user");

		const rows = await db
			.select({
				id: taskRelationTable.id,
				sourceTaskId: taskRelationTable.sourceTaskId,
				targetTaskId: taskRelationTable.targetTaskId,
				relationType: taskRelationTable.relationType,
				createdAt: taskRelationTable.createdAt,
				sourceTaskTitle: sourceAlias.title,
				sourceTaskStatus: sourceAlias.status,
				sourceTaskPriority: sourceAlias.priority,
				sourceTaskNumber: sourceAlias.number,
				sourceTaskProjectId: sourceAlias.projectId,
				sourceTaskUserId: sourceAlias.userId,
				sourceTaskAssigneeName: sourceUserAlias.name,
				targetTaskTitle: targetAlias.title,
				targetTaskStatus: targetAlias.status,
				targetTaskPriority: targetAlias.priority,
				targetTaskNumber: targetAlias.number,
				targetTaskProjectId: targetAlias.projectId,
				targetTaskUserId: targetAlias.userId,
				targetTaskAssigneeName: targetUserAlias.name,
			})
			.from(taskRelationTable)
			.leftJoin(sourceAlias, eq(taskRelationTable.sourceTaskId, sourceAlias.id))
			.leftJoin(targetAlias, eq(taskRelationTable.targetTaskId, targetAlias.id))
			.leftJoin(sourceUserAlias, eq(sourceAlias.userId, sourceUserAlias.id))
			.leftJoin(targetUserAlias, eq(targetAlias.userId, targetUserAlias.id))
			.where(
				or(
					eq(taskRelationTable.sourceTaskId, taskId),
					eq(taskRelationTable.targetTaskId, taskId),
				),
			);

		return rows.map(mapToTaskRelationWithTasks);
	}

	async findById(id: string): Promise<TaskRelation | null> {
		const row = await db.query.taskRelationTable.findFirst({
			where: eq(taskRelationTable.id, id),
		});

		return row ? mapToTaskRelation(row) : null;
	}

	async findExistingRelation(
		sourceTaskId: string,
		targetTaskId: string,
		relationType: string,
	): Promise<TaskRelation | null> {
		const rows = await db
			.select()
			.from(taskRelationTable)
			.where(
				and(
					eq(taskRelationTable.relationType, relationType),
					or(
						and(
							eq(taskRelationTable.sourceTaskId, sourceTaskId),
							eq(taskRelationTable.targetTaskId, targetTaskId),
						),
						and(
							eq(taskRelationTable.sourceTaskId, targetTaskId),
							eq(taskRelationTable.targetTaskId, sourceTaskId),
						),
					),
				),
			)
			.limit(1);

		return rows.length > 0 ? mapToTaskRelation(rows[0]) : null;
	}

	async create(input: {
		sourceTaskId: string;
		targetTaskId: string;
		relationType: string;
	}): Promise<TaskRelation | null> {
		const [row] = await db
			.insert(taskRelationTable)
			.values({
				sourceTaskId: input.sourceTaskId,
				targetTaskId: input.targetTaskId,
				relationType: input.relationType,
			})
			.returning();

		return row ? mapToTaskRelation(row) : null;
	}

	async delete(id: string): Promise<TaskRelation | null> {
		const [row] = await db
			.delete(taskRelationTable)
			.where(eq(taskRelationTable.id, id))
			.returning();

		return row ? mapToTaskRelation(row) : null;
	}
}

export const taskRelationRepository = new DrizzleTaskRelationRepository();
