export interface Workspace {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	metadata: string | null;
	description: string | null;
	createdAt: Date;
}

export interface WorkspaceMember {
	id: string;
	workspaceId: string;
	userId: string;
	role: string;
	joinedAt: Date;
}

export interface WorkspaceMemberWithUser {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
}

export interface WorkspaceWithRelations extends Workspace {
	memberCount?: number;
	projectCount?: number;
}
