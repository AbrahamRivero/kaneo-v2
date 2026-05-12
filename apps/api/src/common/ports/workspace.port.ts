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

export interface WorkspaceRepository {
	findById(id: string): Promise<Workspace | null>;
	findBySlug(slug: string): Promise<Workspace | null>;
	findMember(
		workspaceId: string,
		userId: string,
	): Promise<WorkspaceMember | null>;
}
