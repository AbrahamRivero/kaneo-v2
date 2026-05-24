export type FeatureModule = {
	key: string;
	name: string;
	description: string;
	category:
		| "operations"
		| "finance"
		| "planning"
		| "collaboration"
		| "automation";
	defaultEnabled: boolean;
	dependencies?: string[];
	workspaceNav?: {
		title: string;
		icon: string;
		to: string;
	};
	projectNav?: {
		title: string;
		icon: string;
		to: string;
	};
};
