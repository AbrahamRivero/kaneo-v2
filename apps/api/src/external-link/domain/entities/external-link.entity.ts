export interface ExternalLink {
	id: string;
	taskId: string;
	integrationId: string;
	resourceType: string;
	externalId: string;
	url: string;
	title: string | null;
	metadata: Record<string, unknown> | null;
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
}
