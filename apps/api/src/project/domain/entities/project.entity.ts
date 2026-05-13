export interface Project {
	id: string;
	workspaceId: string;
	name: string;
	slug: string;
	icon: string | null;
	description: string | null;
	isPublic: boolean;
	archivedAt: Date | null;
	createdAt: Date;
}

export interface ProjectWithStatistics extends Project {
	statistics: {
		completionPercentage: number;
		totalTasks: number;
		dueDate: Date | null;
	};
	archivedTasks: unknown[];
	plannedTasks: unknown[];
	columns: unknown[];
}

export interface ProjectWithTasks extends Project {
	tasks: unknown[];
}
