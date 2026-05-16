import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { integrationTable } from "../../../database/schema";
import {
	defaultSlackEvents,
	normalizeSlackConfig,
	type SlackConfig,
	validateSlackConfig,
} from "../../../plugins/slack/config";
import type { SlackIntegrationRepository } from "../../application/ports/slack-integration-repository.port";
import type {
	CreateSlackIntegrationInput,
	SlackIntegrationResponse,
	UpdateSlackIntegrationInput,
} from "../../domain";

function maskWebhookUrl(value: string): string {
	try {
		const url = new URL(value);
		const parts = url.pathname.split("/").filter(Boolean);
		const last = parts[parts.length - 1] ?? "";
		const maskedLast =
			last.length > 8 ? `${last.slice(0, 4)}…${last.slice(-4)}` : "••••";
		return `${url.origin}/${parts.slice(0, -1).join("/")}/${maskedLast}`;
	} catch {
		return "Configured";
	}
}

function toResponse(
	integration: typeof integrationTable.$inferSelect,
): SlackIntegrationResponse {
	const config = normalizeSlackConfig(
		JSON.parse(integration.config) as SlackConfig,
	);

	return {
		id: integration.id,
		projectId: integration.projectId,
		channelName: config.channelName ?? null,
		webhookConfigured: Boolean(config.webhookUrl),
		maskedWebhookUrl: maskWebhookUrl(config.webhookUrl),
		events: {
			...defaultSlackEvents,
			...(config.events ?? {}),
		},
		isActive: integration.isActive,
		createdAt: integration.createdAt,
		updatedAt: integration.updatedAt,
	};
}

export class DrizzleSlackIntegrationRepository
	implements SlackIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<SlackIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "slack"),
			),
		});

		if (!integration) {
			return null;
		}

		return toResponse(integration);
	}

	async create(
		input: CreateSlackIntegrationInput,
	): Promise<SlackIntegrationResponse> {
		const config = normalizeSlackConfig({
			webhookUrl: input.webhookUrl,
			channelName: input.channelName,
			events: input.events as SlackConfig["events"],
		});

		const validation = await validateSlackConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, input.projectId),
				eq(integrationTable.type, "slack"),
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
				type: "slack",
				config: JSON.stringify(config),
				isActive: true,
			});
		}

		const result = await this.findByProjectId(input.projectId);
		if (!result) {
			throw new HTTPException(500, {
				message: "Failed to load Slack integration after save",
			});
		}
		return result;
	}

	async update(
		projectId: string,
		input: UpdateSlackIntegrationInput,
	): Promise<SlackIntegrationResponse> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "slack"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Slack integration not found",
			});
		}

		const currentConfig = normalizeSlackConfig(
			JSON.parse(existing.config) as SlackConfig,
		);

		const nextConfig = normalizeSlackConfig({
			webhookUrl: input.webhookUrl?.trim() || currentConfig.webhookUrl,
			channelName:
				input.channelName === undefined
					? currentConfig.channelName
					: (input.channelName ?? undefined),
			events: {
				...(currentConfig.events ?? {}),
				...(input.events ?? {}),
			} as SlackConfig["events"],
		});

		const validation = await validateSlackConfig(nextConfig);
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
				message: "Failed to load Slack integration after update",
			});
		}
		return result;
	}

	async delete(projectId: string): Promise<{ id: string }> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "slack"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Slack integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(eq(integrationTable.id, existing.id));

		return { id: existing.id };
	}
}

export const slackIntegrationRepository =
	new DrizzleSlackIntegrationRepository();
