import type { InferSelectModel } from "drizzle-orm";
import type {
	templateColumnTable,
	templateTable,
	templateTaskTable,
} from "../../../database/schema";
import type {
	Template,
	TemplateColumn,
	TemplateTask,
	TemplateWithRelations,
} from "../../domain";

type TemplateRow = InferSelectModel<typeof templateTable>;
type TemplateColumnRow = InferSelectModel<typeof templateColumnTable>;
type TemplateTaskRow = InferSelectModel<typeof templateTaskTable>;

export function mapTemplateToEntity(row: TemplateRow): Template {
	return {
		id: row.id,
		workspaceId: row.workspaceId,
		name: row.name,
		description: row.description,
		icon: row.icon,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapTemplateColumnToEntity(
	row: TemplateColumnRow,
): TemplateColumn {
	return {
		id: row.id,
		templateId: row.templateId,
		name: row.name,
		slug: row.slug,
		position: row.position,
		color: row.color,
		isFinal: row.isFinal,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapTemplateTaskToEntity(row: TemplateTaskRow): TemplateTask {
	return {
		id: row.id,
		templateId: row.templateId,
		title: row.title,
		description: row.description,
		columnSlug: row.columnSlug,
		priority: row.priority,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function mapTemplateWithRelations(row: {
	template: TemplateRow;
	columns: TemplateColumnRow[];
	tasks: TemplateTaskRow[];
}): TemplateWithRelations {
	return {
		...mapTemplateToEntity(row.template),
		columns: row.columns.map(mapTemplateColumnToEntity),
		tasks: row.tasks.map(mapTemplateTaskToEntity),
	};
}
