import { client } from "@kaneo/libs";
import type { ExternalLink } from "@/types/external-link";

async function getExternalLinks(taskId: string) {
	const response = await client["external-link"].task[":taskId"].$get({
		param: { taskId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	const data = await response.json();

	return data as ExternalLink[];
}

export default getExternalLinks;
