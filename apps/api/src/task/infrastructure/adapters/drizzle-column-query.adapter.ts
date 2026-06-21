import { columnRepository } from "../../../column/infrastructure/repositories/drizzle-column.repository";
import type { ColumnQueryPort } from "../../application/ports/column-query.port";

export class DrizzleColumnQueryAdapter implements ColumnQueryPort {
	async findByProjectId(projectId: string) {
		return columnRepository.findByProjectId(projectId);
	}
}

export const columnQueryAdapter = new DrizzleColumnQueryAdapter();
