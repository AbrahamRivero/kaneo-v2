import type { WorkspaceMemberWithUser } from "../../domain";
import type { WorkspaceRepository } from "../ports/workspace-repository.port";

export class GetWorkspaceMembersUseCase {
	constructor(private workspaceRepository: WorkspaceRepository) {}

	async execute(workspaceId: string): Promise<WorkspaceMemberWithUser[]> {
		return this.workspaceRepository.findMembersByWorkspaceId(workspaceId);
	}
}
