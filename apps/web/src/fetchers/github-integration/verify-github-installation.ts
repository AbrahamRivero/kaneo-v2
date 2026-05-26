import { client } from "@kaneo/libs";
import type { InferRequestType, InferResponseType } from "hono";
import i18n from "i18next";

export type VerifyGithubInstallationRequest = InferRequestType<
	(typeof client)["github-integration"]["verify"]["$post"]
>["json"];

export type VerifyGithubInstallationResponse = InferResponseType<
	(typeof client)["github-integration"]["verify"]["$post"],
	200
>;

async function verifyGithubInstallation(
	data: VerifyGithubInstallationRequest,
): Promise<VerifyGithubInstallationResponse> {
	const response = await client["github-integration"].verify.$post({
		json: data,
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || i18n.t("common:error.requestFailed"));
	}

	const result = await response.json();

	return result;
}

export default verifyGithubInstallation;
