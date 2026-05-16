import { HTTPException } from "hono/http-exception";
import { normalizeGiteaBaseUrl } from "../../../plugins/gitea/config";
import {
	createGiteaClient,
	verifyGiteaToken,
} from "../../../plugins/gitea/utils/gitea-api";
import type { GiteaServicePort } from "../../application/ports";

export class GiteaService implements GiteaServicePort {
	async listRepositories(baseUrl: string, accessToken: string) {
		const normalized = normalizeGiteaBaseUrl(baseUrl);

		try {
			await verifyGiteaToken(normalized, accessToken);
		} catch {
			throw new HTTPException(401, {
				message: "Invalid Gitea token or could not reach instance.",
			});
		}

		const client = createGiteaClient({
			baseUrl: normalized,
			accessToken,
		});

		const all: Array<{
			id: number;
			name: string;
			full_name: string;
			private: boolean;
			owner: { login: string };
			html_url: string;
		}> = [];
		let page = 1;

		while (true) {
			const batch = await client.listUserRepos(page, 50);
			if (!batch.length) break;

			for (const repo of batch) {
				const ownerLogin = repo.owner?.login ?? repo.owner?.username ?? "";
				all.push({
					id: repo.id,
					name: repo.name,
					full_name: repo.full_name,
					private: repo.private,
					owner: { login: ownerLogin },
					html_url: repo.html_url,
				});
			}

			if (batch.length < 50) break;
			page += 1;
			if (page > 50) break;
		}

		return { repositories: all };
	}

	async verifyAccess(input: {
		baseUrl: string;
		accessToken: string;
		repositoryOwner: string;
		repositoryName: string;
	}) {
		try {
			const normalized = normalizeGiteaBaseUrl(input.baseUrl);
			await verifyGiteaToken(normalized, input.accessToken);

			const client = createGiteaClient({
				baseUrl: normalized,
				accessToken: input.accessToken,
			});

			const repo = await client.getRepo(
				input.repositoryOwner,
				input.repositoryName,
			);

			const perms = repo.permissions;
			const hasIssuesWrite = perms?.admin === true || perms?.push === true;

			return {
				isInstalled: true,
				hasRequiredPermissions: Boolean(hasIssuesWrite),
				repositoryExists: true,
				repositoryPrivate: repo.private,
				missingPermissions: hasIssuesWrite ? [] : ["issues (write)"],
				message: hasIssuesWrite
					? "Token can access the repository."
					: "Token may not have sufficient permissions to manage issues.",
			};
		} catch (error) {
			const err = error as { status?: number; message?: string };

			if (err.status === 404) {
				return {
					isInstalled: false,
					hasRequiredPermissions: false,
					repositoryExists: false,
					repositoryPrivate: null,
					missingPermissions: [] as string[],
					message: "Repository not found or not accessible with this token.",
				};
			}

			if (err.status === 401) {
				throw new HTTPException(401, {
					message: "Invalid Gitea token or unauthorized.",
				});
			}

			throw new HTTPException(500, {
				message:
					error instanceof Error
						? error.message
						: "Failed to verify Gitea access",
			});
		}
	}
}

export const giteaService = new GiteaService();
