import type { WorkflowRule } from "../../domain";
import type { WorkflowRuleRepository } from "../ports";

export class DeleteWorkflowRuleUseCase {
	constructor(private workflowRuleRepository: WorkflowRuleRepository) {}

	async execute(id: string): Promise<WorkflowRule> {
		return this.workflowRuleRepository.delete(id);
	}
}
