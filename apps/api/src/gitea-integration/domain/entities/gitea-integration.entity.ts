export type GiteaIntegrationResponse = {
	id: string;
	projectId: string;
	baseUrl: string;
	repositoryOwner: string;
	repositoryName: string;
	maskedAccessToken: string;
	webhookUrl: string;
	webhookSecret: string;
	branchPattern: string;
	commentTaskLinkOnGiteaIssue: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateGiteaIntegrationInput = {
	projectId: string;
	baseUrl: string;
	accessToken?: string;
	repositoryOwner: string;
	repositoryName: string;
};

export type UpdateGiteaIntegrationInput = {
	isActive?: boolean;
	commentTaskLinkOnGiteaIssue?: boolean;
};

export type VerificationResult = {
	isInstalled: boolean;
	hasRequiredPermissions: boolean;
	repositoryExists: boolean;
	repositoryPrivate: boolean | null;
	missingPermissions: string[];
	message: string;
};

export type Repository = {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	owner: { login: string };
	html_url: string;
};

export type ImportResult = {
	imported: number;
	updated: number;
	skipped: number;
	errors?: string[];
};
