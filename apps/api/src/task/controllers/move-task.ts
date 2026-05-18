import { createTaskUseCases } from "../application";

const { moveTask: moveTaskUseCase } = createTaskUseCases();

async function moveTask({
	taskId,
	destinationProjectId,
	destinationStatus,
	currentUserId,
}: {
	taskId: string;
	destinationProjectId: string;
	destinationStatus?: string;
	currentUserId: string;
}) {
	return moveTaskUseCase.execute({
		taskId,
		destinationProjectId,
		destinationStatus,
		currentUserId,
	});
}

export default moveTask;
