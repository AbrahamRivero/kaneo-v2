export type GitHubIntegrationResponse = {
	id: string;
	projectId: string;
	repositoryOwner: string;
	repositoryName: string;
	installationId: number | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateGithubIntegrationInput = {
	projectId: string;
	repositoryOwner: string;
	repositoryName: string;
};

export type UpdateGithubIntegrationInput = {
	isActive?: boolean;
	commentTaskLinkOnGitHubIssue?: boolean;
};

export type VerificationResult = {
	isInstalled: boolean;
	installationId: number | null;
	repositoryExists: boolean;
	repositoryPrivate: boolean | null;
	permissions: Record<string, string> | null;
	hasRequiredPermissions: boolean;
	missingPermissions: string[];
	installationUrl?: string;
	settingsUrl?: string;
	message: string;
};

export type Repository = {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	owner: {
		login: string;
		avatar_url?: string;
		type?: string;
	};
	description?: string | null;
	html_url: string;
	permissions?: {
		admin?: boolean;
		push?: boolean;
		pull?: boolean;
	};
	updated_at: string;
	installation_id: number;
};

export type ListRepositoriesResult = {
	repositories: Repository[];
	installations: Array<{
		id: number;
		account: { login: string; type: string } | null;
		repositories: string[];
	}>;
	total: number;
};

export type ImportResult = {
	imported: number;
	updated: number;
	skipped: number;
	errors?: string[];
};
