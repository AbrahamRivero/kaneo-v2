import { eq } from "drizzle-orm";
import db from "../database";
import {
	templateColumnTable,
	templateTable,
	templateTaskTable,
} from "../database/schema";

const BUILTIN_TEMPLATE_IDS = {
	blank: "template_builtin_blank_00000000001",
	kanban: "template_builtin_kanban_0000000002",
	agile: "template_builtin_agile_00000000003",
	marketing: "template_builtin_marketing_00000004",
} as const;

const BUILTIN_TEMPLATES = [
	{
		id: BUILTIN_TEMPLATE_IDS.blank,
		name: "Blank",
		description: "Start from scratch with a simple workflow",
		icon: "Layout",
		columns: [
			{ name: "To Do", slug: "to-do", position: 0, isFinal: false },
			{ name: "In Progress", slug: "in-progress", position: 1, isFinal: false },
			{ name: "Done", slug: "done", position: 2, isFinal: true },
		],
		tasks: [],
	},
	{
		id: BUILTIN_TEMPLATE_IDS.kanban,
		name: "Kanban Classic",
		description: "Standard kanban workflow with a review stage",
		icon: "Columns3",
		columns: [
			{ name: "To Do", slug: "to-do", position: 0, isFinal: false },
			{ name: "In Progress", slug: "in-progress", position: 1, isFinal: false },
			{ name: "In Review", slug: "in-review", position: 2, isFinal: false },
			{ name: "Done", slug: "done", position: 3, isFinal: true },
		],
		tasks: [
			{
				title: "Set up project documentation",
				description: "Create the initial project README and docs folder",
				columnSlug: "to-do",
				priority: "medium",
			},
			{
				title: "Define project milestones",
				description: "Outline the key milestones and deliverables",
				columnSlug: "to-do",
				priority: "high",
			},
			{
				title: "Review initial requirements",
				description:
					"Go through the requirements document and provide feedback",
				columnSlug: "in-review",
				priority: "medium",
			},
		],
	},
	{
		id: BUILTIN_TEMPLATE_IDS.agile,
		name: "Agile Sprint",
		description: "Scrum-inspired sprint workflow with backlog",
		icon: "Rocket",
		columns: [
			{ name: "Backlog", slug: "backlog", position: 0, isFinal: false },
			{ name: "To Do", slug: "to-do", position: 1, isFinal: false },
			{ name: "In Progress", slug: "in-progress", position: 2, isFinal: false },
			{ name: "In Review", slug: "in-review", position: 3, isFinal: false },
			{ name: "Done", slug: "done", position: 4, isFinal: true },
		],
		tasks: [
			{
				title: "Sprint planning",
				description: "Conduct sprint planning session with the team",
				columnSlug: "to-do",
				priority: "high",
			},
			{
				title: "Implement user authentication",
				description: "Set up login, registration, and password reset flows",
				columnSlug: "backlog",
				priority: "high",
			},
			{
				title: "Design database schema",
				description: "Create the initial database schema design",
				columnSlug: "in-progress",
				priority: "high",
			},
			{
				title: "Write API documentation",
				description: "Document all REST API endpoints",
				columnSlug: "backlog",
				priority: "medium",
			},
			{
				title: "Set up CI/CD pipeline",
				description: "Configure automated builds and deployments",
				columnSlug: "backlog",
				priority: "medium",
			},
			{
				title: "Review pull requests",
				description: "Review open PRs from the previous sprint",
				columnSlug: "in-review",
				priority: "medium",
			},
		],
	},
	{
		id: BUILTIN_TEMPLATE_IDS.marketing,
		name: "Marketing Campaign",
		description: "Plan and execute marketing campaigns",
		icon: "Megaphone",
		columns: [
			{ name: "Ideation", slug: "ideation", position: 0, isFinal: false },
			{
				name: "In Production",
				slug: "in-production",
				position: 1,
				isFinal: false,
			},
			{ name: "In Review", slug: "in-review", position: 2, isFinal: false },
			{ name: "Published", slug: "published", position: 3, isFinal: true },
		],
		tasks: [
			{
				title: "Research target audience",
				description: "Define demographics and psychographics for the campaign",
				columnSlug: "ideation",
				priority: "high",
			},
			{
				title: "Create campaign brief",
				description: "Outline the campaign goals, channels, and key messages",
				columnSlug: "ideation",
				priority: "high",
			},
			{
				title: "Design social media assets",
				description: "Create images and copy for social media posts",
				columnSlug: "in-production",
				priority: "medium",
			},
			{
				title: "Write blog post",
				description: "Draft the launch blog post",
				columnSlug: "in-production",
				priority: "medium",
			},
			{
				title: "Review final deliverables",
				description: "Final review of all campaign assets before publishing",
				columnSlug: "in-review",
				priority: "high",
			},
		],
	},
];

export async function seedTemplates(): Promise<void> {
	for (const template of BUILTIN_TEMPLATES) {
		const existing = await db.query.templateTable.findFirst({
			where: eq(templateTable.id, template.id),
		});

		if (existing) continue;

		await db.insert(templateTable).values({
			id: template.id,
			workspaceId: null,
			name: template.name,
			description: template.description,
			icon: template.icon,
		});

		if (template.columns.length > 0) {
			await db.insert(templateColumnTable).values(
				template.columns.map((col) => ({
					templateId: template.id,
					name: col.name,
					slug: col.slug,
					position: col.position,
					isFinal: col.isFinal,
				})),
			);
		}

		if (template.tasks.length > 0) {
			await db.insert(templateTaskTable).values(
				template.tasks.map((task) => ({
					templateId: template.id,
					title: task.title,
					description: task.description,
					columnSlug: task.columnSlug,
					priority: task.priority,
				})),
			);
		}
	}

	console.log(`📋 ${BUILTIN_TEMPLATES.length} built-in templates seeded`);
}
