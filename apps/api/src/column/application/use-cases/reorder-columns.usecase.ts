import type { Column } from "../../domain";
import type { ColumnRepository, ReorderColumnInput } from "../ports";

export class ReorderColumnsUseCase {
	constructor(private readonly columnRepository: ColumnRepository) {}

	async execute(
		projectId: string,
		columns: ReorderColumnInput[],
	): Promise<Column[]> {
		return this.columnRepository.reorder(projectId, columns);
	}
}
