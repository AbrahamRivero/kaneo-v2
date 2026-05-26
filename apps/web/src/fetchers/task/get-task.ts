import { client } from "@kaneo/libs";
import type { InferRequestType } from "hono/client";
import i18n from "i18next";

export type GetTaskRequest = InferRequestType<
	(typeof client)["task"][":id"]["$get"]
>["param"];

async function getTask(taskId: string) {
	if (!taskId || taskId.trim().length === 0) {
		throw new Error(i18n.t("common:error.taskIdRequired"));
	}
	const response = await client.task[":id"].$get({ param: { id: taskId } });

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	const data = await response.json();

	return data;
}

export default getTask;
