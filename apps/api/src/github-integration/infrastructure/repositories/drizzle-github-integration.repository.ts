import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { integrationTable } from "../../../database/schema";
import type { GitHubConfig } from "../../../plugins/github/config";
import {
	defaultGitHubConfig as defaultConfig,
	validateGitHubConfig,
} from "../../../plugins/github/config";
import { getGithubApp } from "../../../plugins/github/utils/github-app";
import type { GitHubIntegrationRepository } from "../../application/ports";
import type {
	CreateGithubIntegrationInput,
	GitHubIntegrationResponse,
	UpdateGithubIntegrationInput,
} from "../../domain";

export class DrizzleGitHubIntegrationRepository
	implements GitHubIntegrationRepository
{
	async findByProjectId(
		projectId: string,
	): Promise<GitHubIntegrationResponse | null> {
		const integration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "github"),
			),
		});

		if (!integration) {
			return null;
		}

		const config = JSON.parse(integration.config) as GitHubConfig;

		return {
			id: integration.id,
			projectId: integration.projectId,
			repositoryOwner: config.repositoryOwner,
			repositoryName: config.repositoryName,
			installationId: config.installationId,
			isActive: integration.isActive,
			createdAt: integration.createdAt,
			updatedAt: integration.updatedAt,
		};
	}

	async create(
		input: CreateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse> {
		const githubApp = getGithubApp();

		if (!githubApp) {
			throw new HTTPException(500, {
				message: "GitHub app not configured",
			});
		}

		const project = await db.query.projectTable.findFirst({
			where: eq(projectTable.id, input.projectId),
		});

		if (!project) {
			throw new HTTPException(404, { message: "Project not found" });
		}

		const allGitHubIntegrations = await db.query.integrationTable.findMany({
			where: eq(integrationTable.type, "github"),
		});

		for (const integration of allGitHubIntegrations) {
			if (integration.projectId === input.projectId) {
				continue;
			}

			try {
				const config = JSON.parse(integration.config);
				if (
					config.repositoryOwner === input.repositoryOwner &&
					config.repositoryName === input.repositoryName
				) {
					throw new HTTPException(409, {
						message: `Repository ${input.repositoryOwner}/${input.repositoryName} is already linked to another project`,
					});
				}
			} catch (error) {
				if (error instanceof HTTPException) {
					throw error;
				}
			}
		}

		let installationId: number | null = null;
		try {
			const { data: installation } =
				await githubApp.octokit.rest.apps.getRepoInstallation({
					owner: input.repositoryOwner,
					repo: input.repositoryName,
				});
			installationId = installation.id;
		} catch {
			console.warn("Could not get installation ID for repository");
		}

		const existingIntegration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, input.projectId),
				eq(integrationTable.type, "github"),
			),
		});

		const config = {
			repositoryOwner: input.repositoryOwner,
			repositoryName: input.repositoryName,
			installationId,
			...defaultConfig,
		};

		if (existingIntegration) {
			const [updatedIntegration] = await db
				.update(integrationTable)
				.set({
					config: JSON.stringify(config),
					isActive: true,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(integrationTable.projectId, input.projectId),
						eq(integrationTable.type, "github"),
					),
				)
				.returning();

			return {
				id: updatedIntegration?.id,
				projectId: updatedIntegration?.projectId,
				repositoryOwner: input.repositoryOwner,
				repositoryName: input.repositoryName,
				installationId,
				isActive: updatedIntegration?.isActive,
				createdAt: updatedIntegration?.createdAt,
				updatedAt: updatedIntegration?.updatedAt,
			};
		}

		const [newIntegration] = await db
			.insert(integrationTable)
			.values({
				projectId: input.projectId,
				type: "github",
				config: JSON.stringify(config),
				isActive: true,
			})
			.returning();

		return {
			id: newIntegration?.id,
			projectId: newIntegration?.projectId,
			repositoryOwner: input.repositoryOwner,
			repositoryName: input.repositoryName,
			installationId,
			isActive: newIntegration?.isActive,
			createdAt: newIntegration?.createdAt,
			updatedAt: newIntegration?.updatedAt,
		};
	}

	async update(
		projectId: string,
		input: UpdateGithubIntegrationInput,
	): Promise<GitHubIntegrationResponse> {
		const row = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "github"),
			),
		});

		if (!row) {
			throw new HTTPException(404, { message: "Integration not found" });
		}

		let config: GitHubConfig;
		try {
			config = JSON.parse(row.config) as GitHubConfig;
		} catch {
			throw new HTTPException(500, { message: "Invalid integration config" });
		}

		if (input.commentTaskLinkOnGitHubIssue !== undefined) {
			config = {
				...config,
				commentTaskLinkOnGitHubIssue: input.commentTaskLinkOnGitHubIssue,
			};
		}

		const validation = await validateGitHubConfig(config);
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
					eq(integrationTable.type, "github"),
				),
			);

		return this.findByProjectId(
			projectId,
		) as Promise<GitHubIntegrationResponse>;
	}

	async delete(projectId: string) {
		const existingIntegration = await db.query.integrationTable.findFirst({
			where: and(
				eq(integrationTable.projectId, projectId),
				eq(integrationTable.type, "github"),
			),
		});

		if (!existingIntegration) {
			throw new HTTPException(404, {
				message: "GitHub integration not found",
			});
		}

		await db
			.delete(integrationTable)
			.where(
				and(
					eq(integrationTable.projectId, projectId),
					eq(integrationTable.type, "github"),
				),
			);

		return { success: true, message: "GitHub integration deleted" };
	}
}

export const githubIntegrationRepository =
	new DrizzleGitHubIntegrationRepository();
