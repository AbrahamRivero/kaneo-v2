import { HTTPException } from "hono/http-exception";
import type { Column } from "../../domain";
import type { ColumnRepository } from "../ports";

export class UpdateColumnUseCase {
	constructor(private readonly columnRepository: ColumnRepository) {}

	async execute(
		id: string,
		data: {
			name?: string;
			icon?: string | null;
			color?: string | null;
			isFinal?: boolean;
		},
	): Promise<Column> {
		const existing = await this.columnRepository.findById(id);

		if (!existing) {
			throw new HTTPException(404, { message: "Column not found" });
		}

		return this.columnRepository.update(id, data);
	}
}
