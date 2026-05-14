import { HTTPException } from "hono/http-exception";
import { getGithubApp } from "../../../plugins/github/utils/github-app";
import type { GitHubServicePort } from "../../application/ports";
import type { ListRepositoriesResult, VerificationResult } from "../../domain";

export class GitHubService implements GitHubServicePort {
	async verifyInstallation(
		repositoryOwner: string,
		repositoryName: string,
	): Promise<VerificationResult> {
		const githubApp = getGithubApp();

		try {
			if (!githubApp) {
				throw new HTTPException(500, {
					message: "GitHub app not configured",
				});
			}

			const { data: installation } =
				await githubApp.octokit.rest.apps.getRepoInstallation({
					owner: repositoryOwner,
					repo: repositoryName,
				});

			const octokit = await githubApp.getInstallationOctokit(installation.id);
			const { data: repo } = await octokit.rest.repos.get({
				owner: repositoryOwner,
				repo: repositoryName,
			});

			const requiredPermissions = ["issues"];
			const hasRequiredPermissions = checkPermissions(
				installation.permissions,
				requiredPermissions,
			);
			const missingPermissions = getMissingPermissions(
				installation.permissions,
				requiredPermissions,
			);

			if (!hasRequiredPermissions) {
				return {
					isInstalled: true,
					installationId: installation.id,
					repositoryExists: true,
					repositoryPrivate: repo.private,
					permissions: installation.permissions,
					hasRequiredPermissions: false,
					missingPermissions,
					message: `GitHub App is installed but missing required permissions: ${missingPermissions.join(", ")}`,
					settingsUrl: `https://github.com/settings/installations/${installation.id}`,
					installationUrl: process.env.GITHUB_APP_NAME
						? `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new/permissions?target_id=${repo.id}`
						: undefined,
				};
			}

			return {
				isInstalled: true,
				installationId: installation.id,
				repositoryExists: true,
				repositoryPrivate: repo.private,
				permissions: installation.permissions,
				hasRequiredPermissions: true,
				missingPermissions: [],
				installationUrl: `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new/permissions?target_id=${repo.id}`,
				message:
					"GitHub App is properly installed and has all required permissions",
				settingsUrl: `https://github.com/settings/installations/${installation.id}`,
			};
		} catch (error) {
			const githubError = error as { status?: number; message?: string };

			if (githubError.status === 404) {
				try {
					if (!githubApp) {
						throw new HTTPException(500, {
							message: "GitHub app not configured",
						});
					}

					await githubApp.octokit.rest.repos.get({
						owner: repositoryOwner,
						repo: repositoryName,
					});

					const repoId = await getRepositoryId(repositoryOwner, repositoryName);

					return {
						isInstalled: false,
						installationId: null,
						repositoryExists: true,
						repositoryPrivate: null,
						permissions: null,
						hasRequiredPermissions: false,
						missingPermissions: [],
						message: "Repository exists but GitHub App is not installed",
						installationUrl: process.env.GITHUB_APP_NAME
							? `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new/permissions?target_id=${repoId}`
							: undefined,
						settingsUrl: process.env.GITHUB_APP_NAME
							? `https://github.com/apps/${process.env.GITHUB_APP_NAME}`
							: undefined,
					};
				} catch (repoError) {
					const repoGithubError = repoError as {
						status?: number;
						message?: string;
					};

					if (repoGithubError.status === 404) {
						return {
							isInstalled: false,
							installationId: null,
							repositoryExists: false,
							repositoryPrivate: null,
							permissions: null,
							hasRequiredPermissions: false,
							missingPermissions: [],
							settingsUrl: undefined,
							installationUrl: undefined,
							message: "Repository does not exist or is not accessible",
						};
					}
					throw new HTTPException(500, {
						message: `Failed to verify GitHub installation: ${repoGithubError.status || repoGithubError.message || "Unknown error"}`,
					});
				}
			}

			throw new HTTPException(500, {
				message: `Failed to verify GitHub installation: ${githubError.message || "Unknown error"}`,
			});
		}
	}

	async listUserRepositories(): Promise<ListRepositoriesResult> {
		const githubApp = getGithubApp();

		if (!githubApp) {
			throw new HTTPException(500, {
				message: "GitHub app not configured",
			});
		}

		try {
			const { data: installations } =
				await githubApp.octokit.rest.apps.listInstallations();

			const allRepositories = [];
			const installationsWithRepos = [];

			for (const installation of installations) {
				try {
					const installationOctokit = await githubApp.getInstallationOctokit(
						installation.id,
					);

					const repos = await installationOctokit.paginate(
						installationOctokit.rest.apps.listReposAccessibleToInstallation,
						{
							per_page: 100,
						},
					);

					installationsWithRepos.push({
						id: installation.id,
						account: installation.account
							? {
									login: installation.account.login,
									type: installation.account.type,
								}
							: null,
						repositories: repos.map((repo) => repo.full_name),
					});

					const mappedRepos = repos.map((repo) => ({
						id: repo.id,
						name: repo.name,
						full_name: repo.full_name,
						private: repo.private,
						owner: {
							login: repo.owner.login,
							avatar_url: repo.owner.avatar_url,
							type: repo.owner.type,
						},
						description: repo.description,
						html_url: repo.html_url,
						permissions: repo.permissions
							? {
									admin: repo.permissions.admin,
									push: repo.permissions.push,
									pull: repo.permissions.pull,
								}
							: undefined,
						updated_at: repo.updated_at || new Date().toISOString(),
						installation_id: installation.id,
					}));

					allRepositories.push(...mappedRepos);
				} catch (error) {
					console.warn(
						`Failed to get repositories for installation ${installation.id}:`,
						error,
					);
					installationsWithRepos.push({
						id: installation.id,
						account: installation.account
							? {
									login: installation.account.login,
									type: installation.account.type,
								}
							: null,
						repositories: [],
					});
				}
			}

			const uniqueRepositories = allRepositories
				.filter(
					(repo, index, self) =>
						index === self.findIndex((r) => r.id === repo.id),
				)
				.sort(
					(a, b) =>
						new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
				);

			return {
				repositories: uniqueRepositories,
				installations: installationsWithRepos,
				total: uniqueRepositories.length,
			};
		} catch (error) {
			console.error("Failed to list user repositories:", error);
			throw new HTTPException(500, {
				message: "Failed to fetch repositories from GitHub",
			});
		}
	}
}

export const githubService = new GitHubService();

function checkPermissions(
	permissions: Record<string, string> | undefined,
	required: string[],
): boolean {
	if (!permissions) return false;

	return required.every((perm) => {
		const permissionLevel = permissions[perm];
		return permissionLevel === "write" || permissionLevel === "admin";
	});
}

function getMissingPermissions(
	permissions: Record<string, string> | undefined,
	required: string[],
): string[] {
	if (!permissions) return required;

	return required.filter((perm) => {
		const permissionLevel = permissions[perm];
		return permissionLevel !== "write" && permissionLevel !== "admin";
	});
}

async function getRepositoryId(owner: string, repo: string): Promise<number> {
	const githubApp = getGithubApp();

	try {
		if (!githubApp) {
			throw new HTTPException(500, {
				message: "GitHub app not configured",
			});
		}

		const { data } = await githubApp.octokit.rest.repos.get({
			owner,
			repo,
		});
		return data.id;
	} catch {
		return 0;
	}
}
