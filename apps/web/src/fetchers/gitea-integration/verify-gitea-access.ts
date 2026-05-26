import { client } from "@kaneo/libs";
import type { InferRequestType, InferResponseType } from "hono";
import i18n from "i18next";

export type VerifyGiteaAccessRequest = InferRequestType<
	(typeof client)["gitea-integration"]["verify"]["$post"]
>["json"];

export type VerifyGiteaAccessResponse = InferResponseType<
	(typeof client)["gitea-integration"]["verify"]["$post"],
	200
>;

async function verifyGiteaAccess(
	data: VerifyGiteaAccessRequest,
): Promise<VerifyGiteaAccessResponse> {
	const response = await client["gitea-integration"].verify.$post({
		json: data,
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: i18n.t("common:error.requestFailed") }));
		throw new Error(
			typeof error === "object" && error && "message" in error
				? String((error as { message: string }).message)
				: i18n.t("common:error.requestFailed"),
		);
	}

	return response.json();
}

export default verifyGiteaAccess;
