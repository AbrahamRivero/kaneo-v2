import type { Project } from "../../domain";

export interface CreateProjectInput {
	workspaceId: string;
	name: string;
	icon: string;
	slug: string;
	templateId?: string;
	userId?: string;
}

export interface UpdateProjectInput {
	name?: string;
	icon?: string;
	slug?: string;
	description?: string;
	isPublic?: boolean;
}

export interface ProjectRepository {
	findById(id: string): Promise<Project | null>;
	findByIdWithTasks(id: string): Promise<Project | null>;
	findByIdAndWorkspace(
		id: string,
		workspaceId: string,
	): Promise<Project | null>;
	findByWorkspaceId(
		workspaceId: string,
		includeArchived?: boolean,
	): Promise<Project[]>;
	create(input: CreateProjectInput): Promise<Project>;
	update(id: string, input: UpdateProjectInput): Promise<Project>;
	delete(id: string): Promise<Project>;
	archive(id: string): Promise<Project>;
	unarchive(id: string): Promise<Project>;
}
