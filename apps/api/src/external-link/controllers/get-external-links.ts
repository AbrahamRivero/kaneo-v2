import { GetExternalLinksUseCase } from "../application/use-cases";
import { externalLinkRepository } from "../infrastructure/repositories/drizzle-external-link.repository";

const getExternalLinks = new GetExternalLinksUseCase(externalLinkRepository);

async function getExternalLinksController(taskId: string) {
	return getExternalLinks.execute(taskId);
}

export default getExternalLinksController;
