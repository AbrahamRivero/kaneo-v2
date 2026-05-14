import type { WorkflowRuleWithColumn } from "../../domain";
import type { WorkflowRuleRepository } from "../ports";

export class GetWorkflowRulesUseCase {
	constructor(private workflowRuleRepository: WorkflowRuleRepository) {}

	async execute(projectId: string): Promise<WorkflowRuleWithColumn[]> {
		return this.workflowRuleRepository.findByProjectId(projectId);
	}
}
