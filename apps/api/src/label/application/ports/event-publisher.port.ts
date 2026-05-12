export interface EventPublisher {
	publish(eventType: string, data: unknown): Promise<void>;
}
