import { CreateColumnUseCase } from "../application/use-cases/create-column.usecase";
import { columnRepository } from "../infrastructure/repositories/drizzle-column.repository";

async function createColumn({
	projectId,
	name,
	icon,
	color,
	isFinal,
}: {
	projectId: string;
	name: string;
	icon?: string;
	color?: string;
	isFinal?: boolean;
}) {
	const useCase = new CreateColumnUseCase(columnRepository);
	return useCase.execute({ projectId, name, icon, color, isFinal });
}

export default createColumn;
