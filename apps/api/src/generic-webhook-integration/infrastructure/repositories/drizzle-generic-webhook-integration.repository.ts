import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { integrationTable } from "../../../database/schema";
import {
	defaultGenericWebhookEvents,
	type GenericWebhookConfig,
	normalizeGenericWebhookConfig,
	validateGenericWebhookConfig,
} from "../../../plugins/generic-webhook/config";
import type { GenericWebhookIntegrationRepository } from "../../application/ports/generic-webhook-integration-repository.port";
import type {
	CreateGenericWebhookIntegrationInput,
	GenericWebhookIntegrationResponse,
	UpdateGenericWebhookIntegrationInput,
} from "../../domain";

function maskValue(value: string | undefined): string | null {
	if (!value) return null;
	return value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : "••••";
}

function toResponse(
	integration: typeof integrationTable.$inferSelect,
): GenericWebhookIntegrationResponse {
	const config = normalizeGenericWebhookConfig(
		JSON.parse(integration.config) as GenericWebhookConfig,
	);

	return {
		id: integration.id,
		projectId: integration.projectId,
		webhookConfigured: Boolean(config.webhookUrl),
		maskedWebhookUrl: maskValue(config.webhookUrl),
		secretConfigured: Boolean(config.secret),
		maskedSecret: maskValue(config.secret),
		events: {
			...defaultGenericWebhookEvents,
			...(config.events ?? {}),
		},
		isActive: integration.isActive,
		createdAt: integration.createdAt,
		updatedAt: integration.updatedAt,
	};
}

export class DrizzleGenericWebhookIntegrationRepository
	implements GenericWebhookIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<GenericWebhookIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "generic-webhook"),
			),
		});

		if (!integration) {
			return null;
		}

		return toResponse(integration);
	}

	async create(
		input: CreateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse> {
		const config = normalizeGenericWebhookConfig({
			webhookUrl: input.webhookUrl,
			secret: input.secret,
			events: input.events as GenericWebhookConfig["events"],
		});

		const validation = await validateGenericWebhookConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, input.projectId),
				eq(integrationTable.type, "generic-webhook"),
			),
		});

		if (existing) {
			await db
				.update(integrationTable)
				.set({
					config: JSON.stringify(config),
					isActive: true,
					updatedAt: new Date(),
				})
				.where(eq(integrationTable.id, existing.id));
		} else {
			await db.insert(integrationTable).values({
				projectId: input.projectId,
				type: "generic-webhook",
				config: JSON.stringify(config),
				isActive: true,
			});
		}

		const result = await this.findByProjectId(input.projectId);
		if (!result) {
			throw new HTTPException(500, {
				message: "Failed to load generic webhook integration after save",
			});
		}
		return result;
	}

	async update(
		projectId: string,
		input: UpdateGenericWebhookIntegrationInput,
	): Promise<GenericWebhookIntegrationResponse> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "generic-webhook"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Generic webhook integration not found",
			});
		}

		const currentConfig = normalizeGenericWebhookConfig(
			JSON.parse(existing.config) as GenericWebhookConfig,
		);

		const nextConfig = normalizeGenericWebhookConfig({
			webhookUrl: input.webhookUrl?.trim() || currentConfig.webhookUrl,
			secret:
				input.secret === undefined
					? currentConfig.secret
					: (input.secret ?? undefined),
			events: {
				...(currentConfig.events ?? {}),
				...(input.events ?? {}),
			} as GenericWebhookConfig["events"],
		});

		const validation = await validateGenericWebhookConfig(nextConfig);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		await db
			.update(integrationTable)
			.set({
				config: JSON.stringify(nextConfig),
				isActive:
					input.isActive !== undefined
						? input.isActive
						: (existing.isActive ?? true),
				updatedAt: new Date(),
			})
			.where(eq(integrationTable.id, existing.id));

		const result = await this.findByProjectId(projectId);
		if (!result) {
			throw new HTTPException(500, {
				message: "Failed to load generic webhook integration after update",
			});
		}
		return result;
	}

	async delete(projectId: string): Promise<{ id: string }> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "generic-webhook"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Generic webhook integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(eq(integrationTable.id, existing.id));

		return { id: existing.id };
	}
}

export const genericWebhookIntegrationRepository =
	new DrizzleGenericWebhookIntegrationRepository();
