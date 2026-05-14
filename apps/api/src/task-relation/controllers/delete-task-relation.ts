import { publishEvent } from "../../events";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { DeleteTaskRelationUseCase } from "../application/use-cases";
import { taskRelationRepository } from "../infrastructure/repositories/drizzle-task-relation.repository";

const deleteTaskRelation = new DeleteTaskRelationUseCase(
	taskRelationRepository,
	new DrizzleTaskRepository(),
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function deleteTaskRelationController(id: string, userId: string) {
	return deleteTaskRelation.execute({ id, userId });
}

export default deleteTaskRelationController;
