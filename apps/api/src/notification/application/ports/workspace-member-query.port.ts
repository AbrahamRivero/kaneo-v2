export interface WorkspaceMemberQuery {
	findMemberIdsByWorkspaceId(workspaceId: string): Promise<string[]>;
}
