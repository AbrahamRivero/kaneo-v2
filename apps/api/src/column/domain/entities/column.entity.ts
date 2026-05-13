export interface Column {
	id: string;
	projectId: string;
	name: string;
	slug: string;
	position: number;
	icon: string | null;
	color: string | null;
	isFinal: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface ColumnWithTaskCount extends Column {
	taskCount: number;
}
