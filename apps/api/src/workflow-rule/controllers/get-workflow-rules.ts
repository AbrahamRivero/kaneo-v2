import { GetWorkflowRulesUseCase } from "../application/use-cases";
import { workflowRuleRepository } from "../infrastructure/repositories/drizzle-workflow-rule.repository";

const getWorkflowRules = new GetWorkflowRulesUseCase(workflowRuleRepository);

async function getWorkflowRulesController(projectId: string) {
	return getWorkflowRules.execute(projectId);
}

export default getWorkflowRulesController;
