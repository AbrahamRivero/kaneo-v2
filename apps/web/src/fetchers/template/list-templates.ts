import { client } from "@kaneo/libs";

export type TemplateColumn = {
	id: string;
	templateId: string;
	name: string;
	slug: string;
	position: number;
	color: string | null;
	isFinal: boolean;
	createdAt: string;
	updatedAt: string;
};

export type TemplateTask = {
	id: string;
	templateId: string;
	title: string;
	description: string | null;
	columnSlug: string;
	priority: string;
	createdAt: string;
};

export type Template = {
	id: string;
	workspaceId: string | null;
	name: string;
	description: string | null;
	icon: string;
	createdAt: string;
	updatedAt: string;
	columns: TemplateColumn[];
	tasks: TemplateTask[];
};

async function listTemplates(workspaceId: string): Promise<Template[]> {
	const response = await client.template.workspace[":workspaceId"].$get({
		param: { workspaceId },
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response.json();
}

export default listTemplates;
