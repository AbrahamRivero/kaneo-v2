import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import * as v from "valibot";
import db from "../../../database";
import { integrationTable } from "../../../database/schema";
import {
	defaultTelegramEvents,
	normalizeTelegramConfig,
	type TelegramConfig,
	telegramConfigSchema,
	validateTelegramConfig,
} from "../../../plugins/telegram/config";
import type { TelegramIntegrationRepository } from "../../application/ports/telegram-integration-repository.port";
import type {
	CreateTelegramIntegrationInput,
	TelegramIntegrationResponse,
	UpdateTelegramIntegrationInput,
} from "../../domain";

function maskBotToken(value: string): string {
	const [prefix, suffix = ""] = value.split(":", 2);
	if (!suffix) {
		return "Configured";
	}

	const maskedSuffix =
		suffix.length > 8 ? `${suffix.slice(0, 4)}…${suffix.slice(-4)}` : "••••";
	return `${prefix}:${maskedSuffix}`;
}

function sanitizeTelegramConfigForLog(rawConfig: string): string {
	try {
		const parsed = JSON.parse(rawConfig) as Record<string, unknown>;
		for (const key of [
			"botToken",
			"chatId",
			"threadId",
			"chatLabel",
		] as const) {
			if (key in parsed) {
				parsed[key] = "[REDACTED]";
			}
		}
		return JSON.stringify(parsed);
	} catch {
		return "[UNPARSEABLE]";
	}
}

function parseTelegramIntegrationConfig(
	integration: Pick<TelegramIntegrationResponse, "id" | "projectId"> & {
		config: string;
	},
): TelegramConfig {
	try {
		const parsed = v.parse(
			telegramConfigSchema,
			JSON.parse(integration.config),
		);
		return normalizeTelegramConfig(parsed);
	} catch (error) {
		console.error("Failed to parse Telegram integration config", {
			error,
			integrationId: integration.id,
			projectId: integration.projectId,
			sanitizedConfig: sanitizeTelegramConfigForLog(integration.config),
		});
		throw new HTTPException(500, {
			message: "Stored Telegram integration configuration is invalid",
		});
	}
}

function toResponse(
	integration: typeof integrationTable.$inferSelect,
): TelegramIntegrationResponse {
	const config = parseTelegramIntegrationConfig({
		id: integration.id,
		projectId: integration.projectId,
		config: integration.config,
	});

	return {
		id: integration.id,
		projectId: integration.projectId,
		chatId: config.chatId,
		threadId: config.threadId ?? null,
		chatLabel: config.chatLabel ?? null,
		botTokenConfigured: Boolean(config.botToken),
		maskedBotToken: config.botToken ? maskBotToken(config.botToken) : "",
		events: {
			...defaultTelegramEvents,
			...(config.events ?? {}),
		},
		isActive: integration.isActive,
		createdAt: integration.createdAt,
		updatedAt: integration.updatedAt,
	};
}

export class DrizzleTelegramIntegrationRepository
	implements TelegramIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<TelegramIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "telegram"),
			),
		});

		if (!integration) {
			return null;
		}

		return toResponse(integration);
	}

	async create(
		input: CreateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse> {
		const config = normalizeTelegramConfig({
			botToken: input.botToken,
			chatId: input.chatId,
			threadId: input.threadId,
			chatLabel: input.chatLabel,
			events: input.events as TelegramConfig["events"],
		});

		const validation = validateTelegramConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		const [integration] = await db
			.insert(integrationTable)
			.values({
				projectId: input.projectId,
				type: "telegram",
				config: JSON.stringify(config),
				isActive: true,
			})
			.onConflictDoUpdate({
				target: [integrationTable.projectId, integrationTable.type],
				set: {
					config: JSON.stringify(config),
					updatedAt: new Date(),
				},
			})
			.returning();

		if (!integration) {
			throw new HTTPException(500, {
				message: "Failed to save Telegram integration",
			});
		}

		return toResponse(integration);
	}

	async update(
		projectId: string,
		input: UpdateTelegramIntegrationInput,
	): Promise<TelegramIntegrationResponse> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "telegram"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Telegram integration not found",
			});
		}

		const currentConfig = parseTelegramIntegrationConfig({
			id: existing.id,
			projectId: existing.projectId,
			config: existing.config,
		});

		const nextBotToken =
			"botToken" in input
				? (input.botToken?.trim() ?? "")
				: currentConfig.botToken;
		const nextChatId =
			"chatId" in input ? (input.chatId?.trim() ?? "") : currentConfig.chatId;

		const nextConfig = normalizeTelegramConfig({
			botToken: nextBotToken,
			chatId: nextChatId,
			threadId:
				input.threadId === undefined
					? currentConfig.threadId
					: (input.threadId ?? undefined),
			chatLabel:
				input.chatLabel === undefined
					? currentConfig.chatLabel
					: (input.chatLabel ?? undefined),
			events: {
				...(currentConfig.events ?? {}),
				...(input.events ?? {}),
			} as TelegramConfig["events"],
		});

		const resolvedIsActive =
			input.isActive !== undefined
				? input.isActive
				: (existing.isActive ?? true);

		if (
			JSON.stringify(currentConfig) === JSON.stringify(nextConfig) &&
			resolvedIsActive === (existing.isActive ?? true)
		) {
			return toResponse(existing);
		}

		const validation = validateTelegramConfig(nextConfig);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		await db
			.update(integrationTable)
			.set({
				config: JSON.stringify(nextConfig),
				isActive: resolvedIsActive,
				updatedAt: new Date(),
			})
			.where(eq(integrationTable.id, existing.id));

		const updated = await this.findByProjectId(projectId);
		if (!updated) {
			throw new HTTPException(500, {
				message: "Failed to load Telegram integration after update",
			});
		}
		return updated;
	}

	async delete(projectId: string): Promise<{ id: string }> {
		const existing = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "telegram"),
			),
		});

		if (!existing) {
			throw new HTTPException(404, {
				message: "Telegram integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(eq(integrationTable.id, existing.id));

		return { id: existing.id };
	}
}

export const telegramIntegrationRepository =
	new DrizzleTelegramIntegrationRepository();
