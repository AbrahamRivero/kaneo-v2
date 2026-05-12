import type { InferSelectModel } from "drizzle-orm";
import type {
	workspaceTable,
	workspaceUserTable,
} from "../../../database/schema";
import type {
	Workspace,
	WorkspaceMember,
	WorkspaceMemberWithUser,
} from "../../domain";

type WorkspaceRow = InferSelectModel<typeof workspaceTable>;
type WorkspaceMemberRow = InferSelectModel<typeof workspaceUserTable>;

export function mapWorkspaceToEntity(row: WorkspaceRow): Workspace {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		logo: row.logo,
		metadata: row.metadata,
		description: row.description,
		createdAt: row.createdAt,
	};
}

export function mapWorkspaceMemberToEntity(
	row: WorkspaceMemberRow,
): WorkspaceMember {
	return {
		id: row.id,
		workspaceId: row.workspaceId,
		userId: row.userId,
		role: row.role,
		joinedAt: row.joinedAt,
	};
}

export function mapWorkspaceMemberWithUserToEntity(row: {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
}): WorkspaceMemberWithUser {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		image: row.image,
		role: row.role,
	};
}
