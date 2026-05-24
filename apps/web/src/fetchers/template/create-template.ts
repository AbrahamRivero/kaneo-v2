import { client } from "@kaneo/libs";

export type CreateTemplateRequest = {
	workspaceId: string;
	name: string;
	description?: string;
	icon?: string;
	columns: {
		name: string;
		slug: string;
		position: number;
		color?: string;
		isFinal?: boolean;
	}[];
	tasks?: {
		title: string;
		description?: string;
		columnSlug: string;
		priority?: string;
	}[];
};

async function createTemplate(data: CreateTemplateRequest) {
	const response = await client.template.$post({
		json: data,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default createTemplate;
