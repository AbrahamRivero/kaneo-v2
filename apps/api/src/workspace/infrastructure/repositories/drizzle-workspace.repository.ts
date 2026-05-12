import { eq } from "drizzle-orm";
import db from "../../../database";
import {
	userTable,
	workspaceTable,
	workspaceUserTable,
} from "../../../database/schema";
import type { WorkspaceRepository } from "../../application/ports/workspace-repository.port";
import type { Workspace, WorkspaceMemberWithUser } from "../../domain";
import {
	mapWorkspaceMemberWithUserToEntity,
	mapWorkspaceToEntity,
} from "../mappers/workspace.mapper";

export class DrizzleWorkspaceRepository implements WorkspaceRepository {
	async findById(id: string): Promise<Workspace | null> {
		const workspace = await db.query.workspaceTable.findFirst({
			where: eq(workspaceTable.id, id),
		});
		return workspace ? mapWorkspaceToEntity(workspace) : null;
	}

	async findBySlug(slug: string): Promise<Workspace | null> {
		const workspace = await db.query.workspaceTable.findFirst({
			where: eq(workspaceTable.slug, slug),
		});
		return workspace ? mapWorkspaceToEntity(workspace) : null;
	}

	async findMembersByWorkspaceId(
		workspaceId: string,
	): Promise<WorkspaceMemberWithUser[]> {
		const members = await db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
				image: userTable.image,
				role: workspaceUserTable.role,
			})
			.from(workspaceUserTable)
			.innerJoin(userTable, eq(workspaceUserTable.userId, userTable.id))
			.where(eq(workspaceUserTable.workspaceId, workspaceId));

		return members.map(mapWorkspaceMemberWithUserToEntity);
	}

	async findMember(
		workspaceId: string,
		userId: string,
	): Promise<{
		id: string;
		workspaceId: string;
		userId: string;
		role: string;
		joinedAt: Date;
	} | null> {
		const member = await db.query.workspaceUserTable.findFirst({
			where: (member, { and, eq }) =>
				and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)),
		});
		return member ?? null;
	}
}
