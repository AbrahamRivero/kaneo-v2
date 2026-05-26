import { client } from "@kaneo/libs";
import i18n from "i18next";

export type CreateGiteaIntegrationRequest = {
	baseUrl: string;
	accessToken?: string;
	repositoryOwner: string;
	repositoryName: string;
};

async function createGiteaIntegration(
	projectId: string,
	data: CreateGiteaIntegrationRequest,
) {
	const response = await client["gitea-integration"].project[
		":projectId"
	].$post({
		param: { projectId },
		json: data,
	});

	if (!response.ok) {
		const error = await response
			.clone()
			.json()
			.catch(async () => ({
				message:
					(await response.text()) || i18n.t("common:error.requestFailed"),
			}));
		throw new Error(
			typeof error === "object" && error && "message" in error
				? String(error.message)
				: i18n.t("common:error.requestFailed"),
		);
	}

	return response.json();
}

export default createGiteaIntegration;
