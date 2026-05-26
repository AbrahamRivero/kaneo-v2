import { listFeatures, registerFeature } from "./registry";

export function initializeFeatures(): void {
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
