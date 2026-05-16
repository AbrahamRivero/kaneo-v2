import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { integrationTable, projectTable } from "../../../database/schema";
import {
	type GiteaConfig,
	getDefaultGiteaConfig,
	normalizeGiteaBaseUrl,
	validateGiteaConfig,
} from "../../../plugins/gitea/config";
import {
	createGiteaClient,
	GiteaApiError,
	verifyGiteaToken,
} from "../../../plugins/gitea/utils/gitea-api";
import { normalizeApiServerUrl } from "../../../utils/openapi-spec";
import type { GiteaIntegrationRepository } from "../../application/ports";
import type {
	CreateGiteaIntegrationInput,
	GiteaIntegrationResponse,
	UpdateGiteaIntegrationInput,
} from "../../domain";

function maskToken(token: string): string {
	if (token.length <= 8) {
		return "••••••••";
	}
	return `${token.slice(0, 4)}••••••${token.slice(-4)}`;
}

export class DrizzleGiteaIntegrationRepository
	implements GiteaIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<GiteaIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "gitea"),
			),
		});

		if (!integration) {
			return null;
		}

		const config = JSON.parse(integration.config) as GiteaConfig;

		const apiBase = normalizeApiServerUrl(
			process.env.KANEO_API_URL || "http://localhost:1337",
		);

		return {
			id: integration.id,
			projectId: integration.projectId,
			baseUrl: config.baseUrl,
			repositoryOwner: config.repositoryOwner,
			repositoryName: config.repositoryName,
			maskedAccessToken: maskToken(config.accessToken),
			webhookUrl: `${apiBase.replace(/\/$/, "")}/gitea-integration/webhook/${integration.id}`,
			webhookSecret: config.webhookSecret ?? "",
			branchPattern: config.branchPattern || "{slug}-{number}",
			commentTaskLinkOnGiteaIssue: config.commentTaskLinkOnGiteaIssue !== false,
			isActive: integration.isActive,
			createdAt: integration.createdAt,
			updatedAt: integration.updatedAt,
		};
	}

	async create(
		input: CreateGiteaIntegrationInput,
	): Promise<GiteaIntegrationResponse> {
		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, input.projectId),
		});

		if (!project) {
			throw new HTTPException(404, { message: "Project not found" });
		}

		const normalizedBase = normalizeGiteaBaseUrl(input.baseUrl);

		const existingIntegration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, input.projectId),
				eq(integrationTable.type, "gitea"),
			),
		});

		let resolvedToken = input.accessToken?.trim() ?? "";
		if (!resolvedToken && existingIntegration) {
			try {
				const prev = JSON.parse(existingIntegration.config) as GiteaConfig;
				resolvedToken = prev.accessToken;
			} catch (error) {
				console.warn("Failed to parse existing Gitea integration config", {
					integrationId: existingIntegration.id,
					error,
				});
			}
		}

		if (!resolvedToken) {
			throw new HTTPException(400, {
				message: "Personal access token is required",
			});
		}

		try {
			await verifyGiteaToken(normalizedBase, resolvedToken);

			const client = createGiteaClient({
				baseUrl: normalizedBase,
				accessToken: resolvedToken,
			});
			await client.getRepo(input.repositoryOwner, input.repositoryName);
		} catch (error) {
			if (error instanceof GiteaApiError) {
				throw new HTTPException(error.status || 400, {
					message: error.message,
				});
			}
			throw error;
		}

		const allGitea = await db.query.integrationTable.findMany({
			where: eq(integrationTable.type, "gitea"),
		});

		for (const integration of allGitea) {
			if (integration.projectId === input.projectId) {
				continue;
			}
			if (!integration.isActive) {
				continue;
			}
			try {
				const cfg = JSON.parse(integration.config) as {
					baseUrl?: string;
					repositoryOwner?: string;
					repositoryName?: string;
				};
				if (
					normalizeGiteaBaseUrl(cfg.baseUrl ?? "") === normalizedBase &&
					cfg.repositoryOwner === input.repositoryOwner &&
					cfg.repositoryName === input.repositoryName
				) {
					throw new HTTPException(409, {
						message: `Repository ${input.repositoryOwner}/${input.repositoryName} on this Gitea instance is already linked to another project`,
					});
				}
			} catch (error) {
				if (error instanceof HTTPException) {
					throw error;
				}
				console.warn(
					"Skipping invalid Gitea integration config during conflict check",
					{ integrationId: integration.id, error },
				);
			}
		}

		let webhookSecret = randomBytes(24).toString("hex");
		if (existingIntegration) {
			try {
				const previousConfig = JSON.parse(
					existingIntegration.config,
				) as GiteaConfig;
				webhookSecret = previousConfig.webhookSecret ?? webhookSecret;
			} catch (error) {
				console.warn(
					"Failed to parse existing Gitea config for webhook secret",
					{ integrationId: existingIntegration.id, error },
				);
			}
		}

		const config: GiteaConfig = getDefaultGiteaConfig(
			normalizedBase,
			resolvedToken,
			input.repositoryOwner,
			input.repositoryName,
			webhookSecret,
		);

		const validation = await validateGiteaConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		if (existingIntegration) {
			const [updated] = await db
				.update(integrationTable)
				.set({
					config: JSON.stringify(config),
					isActive: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(integrationTable.projectId, input.projectId),
						eq(integrationTable.type, "gitea"),
					),
				)
				.returning();

			if (!updated) {
				throw new HTTPException(500, {
					message: "Failed to update Gitea integration",
				});
			}

			return this.buildResponse(updated, normalizedBase, webhookSecret);
		}

		const [newIntegration] = await db
			.insert(integrationTable)
			.values({
				projectId: input.projectId,
				type: "gitea",
				config: JSON.stringify(config),
				isActive: true,
			})
			.returning();

		if (!newIntegration) {
			throw new HTTPException(500, {
				message: "Failed to create Gitea integration",
			});
		}

		return this.buildResponse(newIntegration, normalizedBase, webhookSecret);
	}

	async update(
		projectId: string,
		input: UpdateGiteaIntegrationInput,
	): Promise<GiteaIntegrationResponse> {
		const row = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "gitea"),
			),
		});

		if (!row) {
			throw new HTTPException(404, { message: "Integration not found" });
		}

		let config: GiteaConfig;
		try {
			config = JSON.parse(row.config) as GiteaConfig;
		} catch {
			throw new HTTPException(500, { message: "Invalid integration config" });
		}

		if (input.commentTaskLinkOnGiteaIssue !== undefined) {
			config = {
				...config,
				commentTaskLinkOnGiteaIssue: input.commentTaskLinkOnGiteaIssue,
			};
		}

		const validation = await validateGiteaConfig(config);
		if (!validation.valid) {
			throw new HTTPException(400, {
				message: validation.errors?.join(", ") ?? "Invalid config",
			});
		}

		await db
			.update(integrationTable)
			.set({
				config: JSON.stringify(config),
				isActive:
					input.isActive !== undefined
						? input.isActive
						: (row.isActive ?? true),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(integrationTable.projectId, projectId),
					eq(integrationTable.type, "gitea"),
				),
			);

		const result = await this.findByProjectId(projectId);
		if (!result) {
			throw new HTTPException(500, {
				message: "Failed to load integration",
			});
		}
		return result;
	}

	async delete(projectId: string) {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "gitea"),
			),
		});

		if (!integration) {
			throw new HTTPException(404, {
				message: "Gitea integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(
				and(
					eq(integrationTable.projectId, projectId),
					eq(integrationTable.type, "gitea"),
				),
			);

		return { success: true, message: "Gitea integration deleted" };
	}

	private buildResponse(
		integration: typeof integrationTable.$inferSelect,
		baseUrl: string,
		webhookSecret: string,
	): GiteaIntegrationResponse {
		const config = JSON.parse(integration.config) as GiteaConfig;
		const apiBase = normalizeApiServerUrl(
			process.env.KANEO_API_URL || "http://localhost:1337",
		);

		return {
			id: integration.id,
			projectId: integration.projectId,
			baseUrl,
			repositoryOwner: config.repositoryOwner,
			repositoryName: config.repositoryName,
			maskedAccessToken: maskToken(config.accessToken),
			webhookUrl: `${apiBase.replace(/\/$/, "")}/gitea-integration/webhook/${integration.id}`,
			webhookSecret,
			branchPattern: config.branchPattern || "{slug}-{number}",
			commentTaskLinkOnGiteaIssue: config.commentTaskLinkOnGiteaIssue !== false,
			isActive: integration.isActive,
			createdAt: integration.createdAt,
			updatedAt: integration.updatedAt,
		};
	}
}

export const giteaIntegrationRepository =
	new DrizzleGiteaIntegrationRepository();
