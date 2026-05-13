import { ReorderColumnsUseCase } from "../application/use-cases/reorder-columns.usecase";
import { columnRepository } from "../infrastructure/repositories/drizzle-column.repository";

async function reorderColumns(
	projectId: string,
	columns: Array<{ id: string; position: number }>,
) {
	const useCase = new ReorderColumnsUseCase(columnRepository);
	return useCase.execute(projectId, columns);
}

export default reorderColumns;
