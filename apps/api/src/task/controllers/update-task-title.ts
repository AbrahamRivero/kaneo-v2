import { createTaskUseCases } from "../application";

const { updateTaskTitle: updateTaskTitleUseCase } = createTaskUseCases();

async function updateTaskTitle({
	id,
	title,
	currentUserId,
}: {
	id: string;
	title: string;
	currentUserId: string;
}) {
	return updateTaskTitleUseCase.execute(id, title, currentUserId);
}

export default updateTaskTitle;
