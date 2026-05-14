export interface WorkflowRule {
	id: string;
	projectId: string;
	integrationType: string;
	eventType: string;
	columnId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkflowRuleWithColumn extends WorkflowRule {
	columnName: string | null;
	columnSlug: string | null;
}
