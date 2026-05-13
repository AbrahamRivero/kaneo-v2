import type { Column } from "../../domain";
import type { ColumnRepository } from "../ports";

export class GetColumnsUseCase {
	constructor(private readonly columnRepository: ColumnRepository) {}

	async execute(projectId: string): Promise<Column[]> {
		return this.columnRepository.findByProjectId(projectId);
	}
}
