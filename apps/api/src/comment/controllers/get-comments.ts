import { GetCommentsUseCase } from "../application/use-cases";
import { commentRepository } from "../infrastructure/repositories/drizzle-comment.repository";

const getComments = new GetCommentsUseCase(commentRepository);

async function getCommentsController(taskId: string) {
	return getComments.execute(taskId);
}

export default getCommentsController;
