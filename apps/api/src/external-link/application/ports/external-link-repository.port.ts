import type { ExternalLink } from "../../domain";

export interface ExternalLinkRepository {
	findByTaskId(taskId: string): Promise<ExternalLink[]>;
}
