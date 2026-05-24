import { listFeatures, registerFeature } from "./registry";

export function initializeFeatures(): void {
	registerFeature({
		key: "budgets",
		name: "Budgets & Expenses",
		description: "Track project budgets, expenses, and P&L per project",
		category: "finance",
		defaultEnabled: false,
		workspaceNav: {
			title: "Budgets",
			icon: "DollarSign",
			to: "/dashboard/workspace/:workspaceId/budgets",
		},
		projectNav: {
			title: "Budget",
			icon: "DollarSign",
			to: "/dashboard/workspace/:workspaceId/project/:projectId/budget",
		},
	});

	registerFeature({
		key: "suppliers",
		name: "Supplier Directory",
		description: "Manage vendors, contracts, and service orders",
		category: "operations",
		defaultEnabled: false,
		workspaceNav: {
			title: "Suppliers",
			icon: "Building2",
			to: "/dashboard/workspace/:workspaceId/suppliers",
		},
	});

	registerFeature({
		key: "recurring-tasks",
		name: "Recurring Tasks",
		description: "Automatically create tasks on a schedule",
		category: "automation",
		defaultEnabled: false,
	});

	registerFeature({
		key: "templates",
		name: "Project Templates",
		description:
			"Pre-configured project setups with columns, labels, and tasks",
		category: "planning",
		defaultEnabled: false,
	});

	console.log(`📦 ${listFeatures().length} feature modules registered`);
}
