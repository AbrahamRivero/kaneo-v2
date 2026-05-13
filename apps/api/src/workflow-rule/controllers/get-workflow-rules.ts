import { eq } from "drizzle-orm";
import { columnRepository } from "../../column/infrastructure/repositories/drizzle-column.repository";
import db from "../../database";
import { workflowRuleTable } from "../../database/schema";

async function getWorkflowRules(projectId: string) {
	const rules = await db
		.select({
			id: workflowRuleTable.id,
			projectId: workflowRuleTable.projectId,
			integrationType: workflowRuleTable.integrationType,
			eventType: workflowRuleTable.eventType,
			columnId: workflowRuleTable.columnId,
			createdAt: workflowRuleTable.createdAt,
			updatedAt: workflowRuleTable.updatedAt,
		})
		.from(workflowRuleTable)
		.where(eq(workflowRuleTable.projectId, projectId));

	const rulesWithColumnInfo = await Promise.all(
		rules.map(async (rule) => {
			const column = rule.columnId
				? await columnRepository.findById(rule.columnId)
				: null;
			return {
				...rule,
				columnName: column?.name ?? null,
				columnSlug: column?.slug ?? null,
			};
		}),
	);

	return rulesWithColumnInfo;
}

export default getWorkflowRules;
