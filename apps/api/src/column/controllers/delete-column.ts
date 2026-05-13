import { DeleteColumnUseCase } from "../application/use-cases/delete-column.usecase";
import { columnRepository } from "../infrastructure/repositories/drizzle-column.repository";

async function deleteColumn(id: string) {
	const useCase = new DeleteColumnUseCase(columnRepository);
	return useCase.execute(id);
}

export default deleteColumn;
