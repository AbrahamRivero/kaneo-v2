import type { InferSelectModel } from "drizzle-orm";
import type { labelTable } from "../../../database/schema";
import type { Label } from "../../domain";

type LabelRow = InferSelectModel<typeof labelTable>;

export function mapLabelToEntity(row: LabelRow): Label {
	return {
		id: row.id,
		name: row.name,
		color: row.color,
		taskId: row.taskId,
		workspaceId: row.workspaceId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}
