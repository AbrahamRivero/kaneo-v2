export * from "./ports";
export * from "./use-cases";

import { DrizzleWorkspaceRepository } from "../infrastructure/repositories/drizzle-workspace.repository";
import {
	GetWorkspaceBySlugUseCase,
	GetWorkspaceMembersUseCase,
	GetWorkspaceUseCase,
} from "./use-cases";

const workspaceRepository = new DrizzleWorkspaceRepository();

export const createWorkspaceUseCases = () => ({
	getWorkspace: new GetWorkspaceUseCase(workspaceRepository),
	getWorkspaceBySlug: new GetWorkspaceBySlugUseCase(workspaceRepository),
	getWorkspaceMembers: new GetWorkspaceMembersUseCase(workspaceRepository),
});
