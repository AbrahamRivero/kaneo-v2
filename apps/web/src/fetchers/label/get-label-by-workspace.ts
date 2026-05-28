import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";

export type Label = {
	id: string;
	name: string;
	color: string;
	taskId: string | null;
	workspaceId: string;
	createdAt: string;
	updatedAt: string;
};

export type GetLabelsByWorkspaceRequest = InferRequestType<
	(typeof client)["label"]["workspace"][":workspaceId"]["$get"]
>["param"];

async function getLabelsByWorkspace({
	workspaceId,
}: GetLabelsByWorkspaceRequest): Promise<Label[]> {
	const response = await client.label.workspace[":workspaceId"].$get({
		param: {
			workspaceId,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	const data = await response.json();
	return data as Label[];
}

export default getLabelsByWorkspace;
