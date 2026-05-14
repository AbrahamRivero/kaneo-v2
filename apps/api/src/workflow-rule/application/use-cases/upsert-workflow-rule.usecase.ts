import { HTTPException } from "hono/http-exception";
import type { ColumnRepository } from "../../../column/application/ports";
import type { WorkflowRule } from "../../domain";
import type { WorkflowRuleRepository } from "../ports";

export class UpsertWorkflowRuleUseCase {
	constructor(
		private workflowRuleRepository: WorkflowRuleRepository,
		private columnRepository: ColumnRepository,
	) {}

	async execute(input: {
		projectId: string;
		integrationType: string;
		eventType: string;
		columnId: string;
	}): Promise<WorkflowRule> {
		const targetColumn = await this.columnRepository.findById(input.columnId);

		if (!targetColumn || targetColumn.projectId !== input.projectId) {
			throw new HTTPException(400, {
				message: "Column does not belong to the provided project",
			});
		}

		return this.workflowRuleRepository.upsert(
			input.projectId,
			input.integrationType,
			input.eventType,
			input.columnId,
		);
	}
}
