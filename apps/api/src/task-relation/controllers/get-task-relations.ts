import { GetTaskRelationsUseCase } from "../application/use-cases";
import { taskRelationRepository } from "../infrastructure/repositories/drizzle-task-relation.repository";

const getTaskRelations = new GetTaskRelationsUseCase(taskRelationRepository);

async function getTaskRelationsController(taskId: string) {
	return getTaskRelations.execute(taskId);
}

export default getTaskRelationsController;
