import { DeleteWorkflowRuleUseCase } from "../application/use-cases";
import { workflowRuleRepository } from "../infrastructure/repositories/drizzle-workflow-rule.repository";

const deleteWorkflowRule = new DeleteWorkflowRuleUseCase(
	workflowRuleRepository,
);

async function deleteWorkflowRuleController(id: string) {
	return deleteWorkflowRule.execute(id);
}

export default deleteWorkflowRuleController;
