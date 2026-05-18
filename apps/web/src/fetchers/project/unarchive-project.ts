import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type UnarchiveProjectRequest = InferRequestType<
	(typeof client)["project"][":id"]["unarchive"]["$put"]
>["param"];

async function unarchiveProject({ id }: UnarchiveProjectRequest) {
	const response = await client.project[":id"].unarchive.$put({
		param: { id },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	const data = await response.json();

	return data;
}

export default unarchiveProject;
