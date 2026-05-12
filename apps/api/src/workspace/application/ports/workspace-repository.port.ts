import type { Workspace, WorkspaceMemberWithUser } from "../../domain";

export interface WorkspaceRepository {
	findById(id: string): Promise<Workspace | null>;
	findBySlug(slug: string): Promise<Workspace | null>;
	findMembersByWorkspaceId(
		workspaceId: string,
	): Promise<WorkspaceMemberWithUser[]>;
	findMember(
		workspaceId: string,
		userId: string,
	): Promise<{
		id: string;
		workspaceId: string;
		userId: string;
		role: string;
		joinedAt: Date;
	} | null>;
}
