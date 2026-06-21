import { eq } from "drizzle-orm";
import db from "../../../database";
import { workspaceUserTable } from "../../../database/schema";
import type { WorkspaceMemberQuery } from "../../application/ports";

export class DrizzleWorkspaceMemberQueryAdapter
	implements WorkspaceMemberQuery
{
	async findMemberIdsByWorkspaceId(workspaceId: string): Promise<string[]> {
		const members = await db
			.select({ userId: workspaceUserTable.userId })
			.from(workspaceUserTable)
			.where(eq(workspaceUserTable.workspaceId, workspaceId));

		return members.map((m) => m.userId);
	}
}

export const workspaceMemberQueryAdapter =
	new DrizzleWorkspaceMemberQueryAdapter();
