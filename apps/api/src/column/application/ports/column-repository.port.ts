import type { Column, ColumnWithTaskCount } from "../../domain";

export interface CreateColumnInput {
	projectId: string;
	name: string;
	icon?: string;
	color?: string;
	isFinal?: boolean;
}

export interface UpdateColumnInput {
	name?: string;
	icon?: string | null;
	color?: string | null;
	isFinal?: boolean;
}

export interface ReorderColumnInput {
	id: string;
	position: number;
}

export interface ColumnRepository {
	findById(id: string): Promise<Column | null>;
	findByProjectId(projectId: string): Promise<Column[]>;
	findByIdWithTaskCount(id: string): Promise<ColumnWithTaskCount | null>;
	create(input: CreateColumnInput): Promise<Column>;
	createExplicit(
		projectId: string,
		name: string,
		slug: string,
		position: number,
		isFinal: boolean,
	): Promise<Column>;
	update(id: string, input: UpdateColumnInput): Promise<Column>;
	delete(id: string): Promise<Column>;
	reorder(projectId: string, columns: ReorderColumnInput[]): Promise<Column[]>;
	existsBySlug(projectId: string, slug: string): Promise<boolean>;
	findMaxPosition(projectId: string): Promise<number>;
}
