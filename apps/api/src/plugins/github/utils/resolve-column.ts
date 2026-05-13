import { and, eq } from "drizzle-orm";
import { columnRepository } from "../../../column/infrastructure/repositories/drizzle-column.repository";
import db from "../../../database";
import { workflowRuleTable } from "../../../database/schema";

export async function resolveTargetStatus(
	projectId: string,
	eventType: string,
	fallbackStatus: string,
): Promise<string> {
	const projectColumns = await columnRepository.findByProjectId(projectId);

	if (projectColumns.length === 0) {
		return fallbackStatus;
	}

	const rule = await db.query.workflowRuleTable.findFirst({
		where: and(
			eq(workflowRuleTable.projectId, projectId),
			eq(workflowRuleTable.integrationType, "github"),
			eq(workflowRuleTable.eventType, eventType),
		),
	});

	if (rule) {
		const mappedColumn = projectColumns.find(
			(column) => column.id === rule.columnId,
		);
		if (mappedColumn) {
			return mappedColumn.slug;
		}
	}

	const fallbackColumn = projectColumns.find(
		(column) => column.slug === fallbackStatus,
	);
	if (fallbackColumn) {
		return fallbackColumn.slug;
	}

	return projectColumns[0]?.slug ?? fallbackStatus;
}
