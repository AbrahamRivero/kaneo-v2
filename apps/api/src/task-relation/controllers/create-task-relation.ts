import { publishEvent } from "../../events";
import { DrizzleTaskRepository } from "../../task/infrastructure/repositories/drizzle-task.repository";
import { CreateTaskRelationUseCase } from "../application/use-cases";
import { taskRelationRepository } from "../infrastructure/repositories/drizzle-task-relation.repository";

const createTaskRelation = new CreateTaskRelationUseCase(
	taskRelationRepository,
	new DrizzleTaskRepository(),
	{
		publish: async (eventType, data) => {
			await publishEvent(eventType, data);
		},
	},
);

async function createTaskRelationController(input: {
	sourceTaskId: string;
	targetTaskId: string;
	relationType: string;
	userId: string;
}) {
	return createTaskRelation.execute(input);
}

export default createTaskRelationController;
