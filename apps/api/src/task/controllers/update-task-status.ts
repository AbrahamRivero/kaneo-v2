import { createTaskUseCases } from "../application";

const { updateTaskStatus: updateTaskStatusUseCase } = createTaskUseCases();

async function updateTaskStatus({
	id,
	status,
	currentUserId,
}: {
	id: string;
	status: string;
	currentUserId: string;
}) {
	return updateTaskStatusUseCase.execute(id, status, currentUserId);
}

export default updateTaskStatus;
