import { createId } from "@paralleldrive/cuid2";
import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import {
	recurringTaskChecklistItemTable,
	recurringTaskTable,
} from "../../../database/schema";
import type { RecurringTaskRepository } from "../../application/ports/recurring-task-repository.port";
import type {
	CreateChecklistItemInput,
	CreateRecurringTaskInput,
	RecurringTask,
	RecurringTaskChecklistItem,
	RecurringTaskWithChecklist,
	UpdateRecurringTaskInput,
} from "../../domain";
import {
	mapChecklistItemToEntity,
	mapRecurringTaskToEntity,
} from "../mappers/recurring-task.mapper";

function assertRow<T>(row: T | undefined, message: string): asserts row is T {
	if (!row) {
		throw new HTTPException(500, { message });
	}
}

export class DrizzleRecurringTaskRepository implements RecurringTaskRepository {
	async findByProjectId(
		projectId: string,
	): Promise<RecurringTaskWithChecklist[]> {
		const tasks = await db.query.recurringTaskTable.findMany({
			where: eq(recurringTaskTable.projectId, projectId),
			orderBy: (fields, { desc }) => [desc(fields.createdAt)],
		});

		if (tasks.length === 0)
			return tasks.map(
				mapRecurringTaskToEntity,
			) as RecurringTaskWithChecklist[];

		const taskIds = tasks.map((t) => t.id);
		const checklistItems = await db
			.select()
			.from(recurringTaskChecklistItemTable)
			.where(inArray(recurringTaskChecklistItemTable.recurringTaskId, taskIds))
			.orderBy(recurringTaskChecklistItemTable.position);

		const grouped = new Map<string, typeof checklistItems>();
		for (const item of checklistItems) {
			const list = grouped.get(item.recurringTaskId);
			if (list) {
				list.push(item);
			} else {
				grouped.set(item.recurringTaskId, [item]);
			}
		}

		return tasks.map((task) => ({
			...mapRecurringTaskToEntity(task),
			checklistItems: (grouped.get(task.id) ?? []).map(
				mapChecklistItemToEntity,
			),
		}));
	}

	async create(input: CreateRecurringTaskInput): Promise<RecurringTask> {
		const { createdBy, projectId, checklistItems, ...insertData } = input;
		const [task] = await db
			.insert(recurringTaskTable)
			.values({
				...insertData,
				projectId,
				createdBy: createdBy ?? null,
			})
			.returning();

		assertRow(task, "Failed to create recurring task");

		if (checklistItems && checklistItems.length > 0) {
			await db.insert(recurringTaskChecklistItemTable).values(
				checklistItems.map((item) => ({
					id: createId(),
					recurringTaskId: task.id,
					text: item.text,
					position: item.position,
				})),
			);
		}

		return mapRecurringTaskToEntity(task);
	}

	async findById(id: string): Promise<RecurringTask | null> {
		const [task] = await db
			.select()
			.from(recurringTaskTable)
			.where(eq(recurringTaskTable.id, id))
			.limit(1);

		if (!task) return null;
		return mapRecurringTaskToEntity(task);
	}

	async update(
		id: string,
		input: UpdateRecurringTaskInput,
	): Promise<RecurringTask> {
		const { checklistItems, ...updateData } = input;
		const [task] = await db
			.update(recurringTaskTable)
			.set(updateData)
			.where(eq(recurringTaskTable.id, id))
			.returning();

		assertRow(task, "Recurring task not found for update");

		if (checklistItems) {
			await db.transaction(async (tx) => {
				await tx
					.delete(recurringTaskChecklistItemTable)
					.where(eq(recurringTaskChecklistItemTable.recurringTaskId, id));

				if (checklistItems.length > 0) {
					await tx.insert(recurringTaskChecklistItemTable).values(
						checklistItems.map((item) => ({
							id: createId(),
							recurringTaskId: id,
							text: item.text,
							position: item.position,
						})),
					);
				}
			});
		}

		return mapRecurringTaskToEntity(task);
	}

	async delete(id: string): Promise<RecurringTask> {
		const [task] = await db
			.delete(recurringTaskTable)
			.where(eq(recurringTaskTable.id, id))
			.returning();

		assertRow(task, "Recurring task not found for deletion");
		return mapRecurringTaskToEntity(task);
	}

	async findChecklistItems(
		recurringTaskId: string,
	): Promise<RecurringTaskChecklistItem[]> {
		const items = await db
			.select()
			.from(recurringTaskChecklistItemTable)
			.where(
				eq(recurringTaskChecklistItemTable.recurringTaskId, recurringTaskId),
			)
			.orderBy(recurringTaskChecklistItemTable.position);

		return items.map(mapChecklistItemToEntity);
	}

	async createChecklistItem(
		input: CreateChecklistItemInput,
	): Promise<RecurringTaskChecklistItem> {
		const [item] = await db
			.insert(recurringTaskChecklistItemTable)
			.values({
				id: createId(),
				recurringTaskId: input.recurringTaskId,
				text: input.text,
				position: input.position,
			})
			.returning();

		assertRow(item, "Failed to create checklist item");
		return mapChecklistItemToEntity(item);
	}

	async deleteChecklistItem(
		checklistItemId: string,
	): Promise<RecurringTaskChecklistItem> {
		const [item] = await db
			.delete(recurringTaskChecklistItemTable)
			.where(eq(recurringTaskChecklistItemTable.id, checklistItemId))
			.returning();

		assertRow(item, "Checklist item not found for deletion");
		return mapChecklistItemToEntity(item);
	}
}

export const recurringTaskRepository = new DrizzleRecurringTaskRepository();
