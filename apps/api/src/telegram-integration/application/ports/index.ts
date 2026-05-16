export type { EventPublisher } from "../../../common/ports/event-publisher.port";

export type IntegrationEventData = {
	projectId: string;
	userId: string;
	integrationType: "telegram";
	integrationId: string;
	apiKeyId?: string;
};
