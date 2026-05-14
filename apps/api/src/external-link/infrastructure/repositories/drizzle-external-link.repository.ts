import { eq } from "drizzle-orm";
import db from "../../../database";
import { externalLinkTable } from "../../../database/schema";
import type { ExternalLinkRepository } from "../../application/ports";
import type { ExternalLink } from "../../domain";
import { mapToExternalLink } from "../mappers/external-link.mapper";

export class DrizzleExternalLinkRepository implements ExternalLinkRepository {
	async findByTaskId(taskId: string): Promise<ExternalLink[]> {
		const rows = await db.query.externalLinkTable.findMany({
			where: eq(externalLinkTable.taskId, taskId),
			with: {
				integration: true,
			},
		});

		return rows.map(mapToExternalLink);
	}
}

export const externalLinkRepository = new DrizzleExternalLinkRepository();
