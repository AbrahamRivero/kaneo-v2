import type { ExternalLink } from "../../domain";

type ExternalLinkRow = {
	id: string;
	taskId: string;
	integrationId: string;
	resourceType: string;
	externalId: string;
	url: string;
	title: string | null;
	metadata: string | null;
	createdAt: Date;
	updatedAt: Date;
	integration?: {
		id: string;
		projectId: string;
		type: string;
		enabled: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
};

export function mapToExternalLink(row: ExternalLinkRow): ExternalLink {
	return {
		id: row.id,
		taskId: row.taskId,
		integrationId: row.integrationId,
		resourceType: row.resourceType,
		externalId: row.externalId,
		url: row.url,
		title: row.title,
		metadata: row.metadata ? JSON.parse(row.metadata) : null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		integration: row.integration,
	};
}
