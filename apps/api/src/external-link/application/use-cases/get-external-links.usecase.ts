import type { ExternalLink } from "../../domain";
import type { ExternalLinkRepository } from "../ports";

export class GetExternalLinksUseCase {
	constructor(private externalLinkRepository: ExternalLinkRepository) {}

	async execute(taskId: string): Promise<ExternalLink[]> {
		return this.externalLinkRepository.findByTaskId(taskId);
	}
}
