import { createTaskUseCases } from "../application";

const { updateTaskAssignee: updateTaskAssigneeUseCase } = createTaskUseCases();

async function updateTaskAssignee({
	id,
	userId,
	currentUserId,
}: {
	id: string;
	userId: string;
	currentUserId: string;
}) {
	return updateTaskAssigneeUseCase.execute(id, userId, currentUserId);
}

export default updateTaskAssignee;
