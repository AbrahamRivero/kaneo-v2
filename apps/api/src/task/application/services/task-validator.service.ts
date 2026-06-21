import { HTTPException } from "hono/http-exception";
import { VIRTUAL_STATUSES } from "../../domain";
import { columnQueryAdapter } from "../../infrastructure/adapters/drizzle-column-query.adapter";
import type { ColumnQueryPort } from "../ports/column-query.port";

export class TaskValidatorService {
	constructor(private columnQuery: ColumnQueryPort) {}

	async getValidTaskStatuses(projectId: string): Promise<string[]> {
		const columns = await this.columnQuery.findByProjectId(projectId);

		return [...columns.map((c) => c.slug), ...VIRTUAL_STATUSES];
	}

	async assertValidTaskStatus(
		status: string,
		projectId: string,
	): Promise<void> {
		const validStatuses = await this.getValidTaskStatuses(projectId);

		if (!validStatuses.includes(status)) {
			throw new HTTPException(400, {
				message: `Invalid status "${status}". Valid statuses for this project: ${validStatuses.join(", ")}`,
			});
		}
	}
}

export const taskValidatorService = new TaskValidatorService(
	columnQueryAdapter,
);

export async function getValidTaskStatuses(
	projectId: string,
): Promise<string[]> {
	return taskValidatorService.getValidTaskStatuses(projectId);
}

export async function assertValidTaskStatus(
	status: string,
	projectId: string,
): Promise<void> {
	return taskValidatorService.assertValidTaskStatus(status, projectId);
}
