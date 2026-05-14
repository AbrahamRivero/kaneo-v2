import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { columnTable, workflowRuleTable } from "../../../database/schema";
import type { WorkflowRuleRepository } from "../../application/ports";
import type { WorkflowRule, WorkflowRuleWithColumn } from "../../domain";
import {
	mapToWorkflowRule,
	mapToWorkflowRuleWithColumn,
} from "../mappers/workflow-rule.mapper";

export class DrizzleWorkflowRuleRepository implements WorkflowRuleRepository {
	async findByProjectId(projectId: string): Promise<WorkflowRuleWithColumn[]> {
		const rows = await db
			.select({
				id: workflowRuleTable.id,
				projectId: workflowRuleTable.projectId,
				integrationType: workflowRuleTable.integrationType,
				eventType: workflowRuleTable.eventType,
				columnId: workflowRuleTable.columnId,
				createdAt: workflowRuleTable.createdAt,
				updatedAt: workflowRuleTable.updatedAt,
				columnName: columnTable.name,
				columnSlug: columnTable.slug,
			})
			.from(workflowRuleTable)
			.leftJoin(columnTable, eq(workflowRuleTable.columnId, columnTable.id))
			.where(eq(workflowRuleTable.projectId, projectId));

		return rows.map(mapToWorkflowRuleWithColumn);
	}

	async upsert(
		projectId: string,
		integrationType: string,
		eventType: string,
		columnId: string,
	): Promise<WorkflowRule> {
		const existing = await db.query.workflowRuleTable.findFirst({
			where: and(
				eq(workflowRuleTable.projectId, projectId),
				eq(workflowRuleTable.integrationType, integrationType),
				eq(workflowRuleTable.eventType, eventType),
			),
		});

		if (existing) {
			const [updated] = await db
				.update(workflowRuleTable)
				.set({ columnId })
				.where(eq(workflowRuleTable.id, existing.id))
				.returning();

			if (!updated) {
				throw new HTTPException(500, {
					message: "Failed to update workflow rule",
				});
			}

			return mapToWorkflowRule(updated);
		}

		const [created] = await db
			.insert(workflowRuleTable)
			.values({
				projectId,
				integrationType,
				eventType,
				columnId,
			})
			.returning();

		if (!created) {
			throw new HTTPException(500, {
				message: "Failed to create workflow rule",
			});
		}

		return mapToWorkflowRule(created);
	}

	async delete(id: string): Promise<WorkflowRule> {
		const existing = await db.query.workflowRuleTable.findFirst({
			where: eq(workflowRuleTable.id, id),
		});

		if (!existing) {
			throw new HTTPException(404, { message: "Workflow rule not found" });
		}

		await db.delete(workflowRuleTable).where(eq(workflowRuleTable.id, id));

		return mapToWorkflowRule(existing);
	}
}

export const workflowRuleRepository = new DrizzleWorkflowRuleRepository();
