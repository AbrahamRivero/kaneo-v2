import type {
	NotificationPreferenceResponse,
	UpsertWorkspaceRuleInput,
} from "../../domain";
import type { NotificationPreferenceRepository } from "../ports";

export class UpsertWorkspaceRuleUseCase {
	constructor(private repository: NotificationPreferenceRepository) {}

	async execute(
		userId: string,
		workspaceId: string,
		emailAddress: string | null,
		input: UpsertWorkspaceRuleInput,
	): Promise<NotificationPreferenceResponse> {
		return this.repository.upsertWorkspaceRule(
			userId,
			workspaceId,
			emailAddress,
			input,
		);
	}
}
