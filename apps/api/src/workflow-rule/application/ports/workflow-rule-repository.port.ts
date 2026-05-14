import type { WorkflowRule, WorkflowRuleWithColumn } from "../../domain";

export interface WorkflowRuleRepository {
	findByProjectId(projectId: string): Promise<WorkflowRuleWithColumn[]>;
	upsert(
		projectId: string,
		integrationType: string,
		eventType: string,
		columnId: string,
	): Promise<WorkflowRule>;
	delete(id: string): Promise<WorkflowRule>;
}
