import { client } from "@kaneo/libs";
import type { InferRequestType, InferResponseType } from "hono";
import i18n from "i18next";

export type ListGiteaRepositoriesRequest = InferRequestType<
	(typeof client)["gitea-integration"]["repositories"]["$post"]
>["json"];

export type ListGiteaRepositoriesResponse = InferResponseType<
	(typeof client)["gitea-integration"]["repositories"]["$post"],
	200
>;

async function listGiteaRepositories(
	data: ListGiteaRepositoriesRequest,
): Promise<ListGiteaRepositoriesResponse> {
	const response = await client["gitea-integration"].repositories.$post({
		json: data,
	});

	if (!response.ok) {
		const err = await response.text();
		throw new Error(err || i18n.t("common:error.requestFailed"));
	}

	return response.json();
}

export default listGiteaRepositories;
