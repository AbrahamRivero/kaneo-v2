import { GetColumnsUseCase } from "../application/use-cases/get-columns.usecase";
import { columnRepository } from "../infrastructure/repositories/drizzle-column.repository";

async function getColumns(projectId: string) {
	const useCase = new GetColumnsUseCase(columnRepository);
	return useCase.execute(projectId);
}

export default getColumns;
