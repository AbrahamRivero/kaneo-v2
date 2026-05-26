import { client } from "@kaneo/libs";
import i18n from "i18next";

async function moveTask({
	taskId,
	destinationProjectId,
	destinationStatus,
}: {
	taskId: string;
	destinationProjectId: string;
	destinationStatus?: string;
}) {
	const response = await client.task.move[":id"].$put({
		param: { id: taskId },
		json: {
			destinationProjectId,
			destinationStatus,
		},
	});

	if (!response.ok) {
		let message: string;
		try {
			const json = await response.json();
			message =
				(json as { message?: string; error?: string }).message ||
				(json as { error?: string }).error ||
				JSON.stringify(json);
		} catch {
			message =
				(await response.text().catch(() => "")) ||
				i18n.t("common:error.apiError", { status: response.status });
		}
		throw new Error(message);
	}

	return response.json();
}

export default moveTask;
