import type { NotificationPreferenceResponse } from "../../domain";
import type { NotificationPreferenceRepository } from "../ports";

export class DeleteWorkspaceRuleUseCase {
	constructor(private repository: NotificationPreferenceRepository) {}

	async execute(
		userId: string,
		workspaceId: string,
		emailAddress: string | null,
	): Promise<NotificationPreferenceResponse> {
		return this.repository.deleteWorkspaceRule(
			userId,
			workspaceId,
			emailAddress,
		);
	}
}
