import { UpdateColumnUseCase } from "../application/use-cases/update-column.usecase";
import { columnRepository } from "../infrastructure/repositories/drizzle-column.repository";

async function updateColumn(
	id: string,
	data: {
		name?: string;
		icon?: string | null;
		color?: string | null;
		isFinal?: boolean;
	},
) {
	const useCase = new UpdateColumnUseCase(columnRepository);
	return useCase.execute(id, data);
}

export default updateColumn;
