import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { integrationTable } from "../../../database/schema";
import {
	type DiscordConfig,
	defaultDiscordEvents,
	normalizeDiscordConfig,
	validateDiscordConfig,
} from "../../../plugins/discord/config";
import type { DiscordIntegrationRepository } from "../../application/ports/discord-integration-repository.port";
import type {
	CreateDiscordIntegrationInput,
	DiscordIntegrationResponse,
	UpdateDiscordIntegrationInput,
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
): DiscordIntegrationResponse {
	const config = normalizeDiscordConfig(
		JSON.parse(integration.config) as DiscordConfig,
	);

	return {
		id: integration.id,
		projectId: integration.projectId,
		channelName: config.channelName ?? null,
		webhookConfigured: Boolean(config.webhookUrl),
		maskedWebhookUrl: config.webhookUrl
			? maskWebhookUrl(config.webhookUrl)
			: "",
		events: {
			...defaultDiscordEvents,
			...(config.events ?? {}),
		},
		isActive: integration.isActive,
		createdAt: integration.createdAt,
		updatedAt: integration.updatedAt,
	};
}

export class DrizzleDiscordIntegrationRepository
	implements DiscordIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<DiscordIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "discord"),
			),
		});

		if (!integration) {
			return null;
		}

		return toResponse(integration);
	}

	async create(
		input: CreateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse> {
		const config = normalizeDiscordConfig({
			webhookUrl: input.webhookUrl,
			channelName: input.channelName,
			events: input.events as DiscordConfig["events"],
		});

		const validation = await validateDiscordConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		await db
			.insert(integrationTable)
			.values({
				projectId: input.projectId,
				type: "discord",
				config: JSON.stringify(config),
				isActive: true,
			})
			.onConflictDoUpdate({
				target: [integrationTable.projectId, integrationTable.type],
				set: {
					config: JSON.stringify(config),
					isActive: true,
					updatedAt: new Date(),
				},
			});

		const result = await this.findByProjectId(input.projectId);
		if (!result) {
			throw new HTTPException(500, {
				message: "Failed to load Discord integration after save",
			});
		}
		return result;
	}

	async update(
		projectId: string,
		input: UpdateDiscordIntegrationInput,
	): Promise<DiscordIntegrationResponse> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "discord"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Discord integration not found",
			});
		}

		const currentConfig = normalizeDiscordConfig(
			JSON.parse(existing.config) as DiscordConfig,
		);

		const nextConfig = normalizeDiscordConfig({
			webhookUrl: input.webhookUrl?.trim() || currentConfig.webhookUrl,
			channelName:
				input.channelName === undefined
					? currentConfig.channelName
					: (input.channelName ?? undefined),
			events: {
				...(currentConfig.events ?? {}),
				...(input.events ?? {}),
			} as DiscordConfig["events"],
		});

		const validation = await validateDiscordConfig(nextConfig);
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
				message: "Failed to load Discord integration after update",
			});
		}
		return result;
	}

	async delete(projectId: string): Promise<{ id: string }> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "discord"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Discord integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(eq(integrationTable.id, existing.id));

		return { id: existing.id };
	}
}

export const discordIntegrationRepository =
	new DrizzleDiscordIntegrationRepository();
