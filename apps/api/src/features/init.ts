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
		key: "intake-forms",
		name: "Intake Forms",
		description: "Public forms that create tasks automatically",
		category: "automation",
		defaultEnabled: false,
	});

	registerFeature({
		key: "approvals",
		name: "Approvals",
		description: "Require approval before tasks move between columns",
		category: "operations",
		defaultEnabled: false,
	});

	registerFeature({
		key: "calendar-view",
		name: "Calendar View",
		description: "View tasks on a monthly/weekly calendar",
		category: "planning",
		defaultEnabled: false,
		projectNav: {
			title: "Calendar",
			icon: "CalendarDays",
			to: "/dashboard/workspace/:workspaceId/project/:projectId/calendar",
		},
	});

	registerFeature({
		key: "templates",
		name: "Project Templates",
		description:
			"Pre-configured project setups with columns, labels, and tasks",
		category: "planning",
		defaultEnabled: false,
	});

	registerFeature({
		key: "custom-fields",
		name: "Custom Fields",
		description: "Add custom data fields to tasks for your industry",
		category: "operations",
		defaultEnabled: false,
	});

	registerFeature({
		key: "client-portal",
		name: "Client Portal",
		description: "Give external clients limited access to their projects",
		category: "collaboration",
		defaultEnabled: false,
	});

	console.log(`📦 ${listFeatures().length} feature modules registered`);
}
