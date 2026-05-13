import { HTTPException } from "hono/http-exception";
import type { Column } from "../../domain";
import type { ColumnRepository } from "../ports";

export class DeleteColumnUseCase {
	constructor(private readonly columnRepository: ColumnRepository) {}

	async execute(id: string): Promise<Column> {
		const existing = await this.columnRepository.findByIdWithTaskCount(id);

		if (!existing) {
			throw new HTTPException(404, { message: "Column not found" });
		}

		if (existing.taskCount > 0) {
			throw new HTTPException(409, {
				message:
					"Cannot delete column that contains tasks. Move or delete tasks first.",
			});
		}

		return this.columnRepository.delete(id);
	}
}
