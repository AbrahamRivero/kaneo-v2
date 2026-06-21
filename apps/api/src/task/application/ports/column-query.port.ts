import type { Column } from "../../../column/domain";

export interface ColumnQueryPort {
	findByProjectId(projectId: string): Promise<Column[]>;
}
