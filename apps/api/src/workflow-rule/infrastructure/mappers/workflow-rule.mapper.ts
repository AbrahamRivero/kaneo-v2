import type { WorkflowRule, WorkflowRuleWithColumn } from "../../domain";

type WorkflowRuleRow = {
	id: string;
	projectId: string;
	integrationType: string;
	eventType: string;
	columnId: string;
	createdAt: Date;
	updatedAt: Date;
};

type WorkflowRuleWithColumnRow = WorkflowRuleRow & {
	columnName: string | null;
	columnSlug: string | null;
};

export function mapToWorkflowRule(row: WorkflowRuleRow): WorkflowRule {
	return {
		id: row.id,
		projectId: row.projectId,
		integrationType: row.integrationType,
		eventType: row.eventType,
		columnId: row.columnId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapToWorkflowRuleWithColumn(
	row: WorkflowRuleWithColumnRow,
): WorkflowRuleWithColumn {
	return {
		...mapToWorkflowRule(row),
		columnName: row.columnName,
		columnSlug: row.columnSlug,
	};
}
