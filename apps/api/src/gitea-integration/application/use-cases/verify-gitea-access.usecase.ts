import type { VerificationResult } from "../../domain";
import type { GiteaServicePort } from "../ports";

export class VerifyGiteaAccessUseCase {
	constructor(private service: GiteaServicePort) {}

	async execute(input: {
		baseUrl: string;
		accessToken: string;
		repositoryOwner: string;
		repositoryName: string;
	}): Promise<VerificationResult> {
		return this.service.verifyAccess(input);
	}
}
