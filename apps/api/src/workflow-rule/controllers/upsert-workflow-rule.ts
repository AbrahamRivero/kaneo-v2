import { columnRepository } from "../../column/infrastructure/repositories/drizzle-column.repository";
import { UpsertWorkflowRuleUseCase } from "../application/use-cases";
import { workflowRuleRepository } from "../infrastructure/repositories/drizzle-workflow-rule.repository";

const upsertWorkflowRule = new UpsertWorkflowRuleUseCase(
	workflowRuleRepository,
	columnRepository,
);

async function upsertWorkflowRuleController(input: {
	projectId: string;
	integrationType: string;
	eventType: string;
	columnId: string;
}) {
	return upsertWorkflowRule.execute(input);
}

export default upsertWorkflowRuleController;
