import { HTTPException } from "hono/http-exception";

export type TaskPriority = "no-priority" | "low" | "medium" | "high" | "urgent";

export interface Task {
	id: string;
	projectId: string;
	userId: string | null;
	createdBy: string | null;
	title: string;
	description: string | null;
	status: string;
	priority: TaskPriority;
	startDate: Date | null;
	dueDate: Date | null;
	position: number | null;
	number: number | null;
	columnId: string | null;
	recurringTaskId: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskWithRelations extends Task {
	assigneeName: string | null;
	assigneeId: string | null;
	assigneeImage: string | null;
	creatorName: string | null;
	creatorImage: string | null;
	columnName?: string | null;
	labels?: Array<{ id: string; name: string; color: string }>;
	externalLinks?: Array<{
		id: string;
		taskId: string;
		integrationId: string;
		resourceType: string;
		externalId: string;
		url: string;
		title: string | null;
		metadata: Record<string, unknown> | null;
	}>;
	assets?: Array<{
		id: string;
		workspaceId: string;
		projectId: string;
		taskId: string | null;
		objectKey: string;
		filename: string;
		mimeType: string;
		size: number;
		kind: string;
		surface: string;
		url: string;
		createdBy: string | null;
		createdAt: Date;
		updatedAt?: Date;
	}>;
}

export const VALID_PRIORITIES: TaskPriority[] = [
	"no-priority",
	"low",
	"medium",
	"high",
	"urgent",
];

export const VIRTUAL_STATUSES = ["planned", "archived"] as const;

export function assertValidPriority(priority: string): void {
	if (!(VALID_PRIORITIES as readonly string[]).includes(priority)) {
		throw new HTTPException(400, {
			message: `Invalid priority "${priority}". Valid values: ${VALID_PRIORITIES.join(", ")}`,
		});
	}
}

export function coerceStatus(
	status: string,
	validStatuses: string[],
): { status: string; warning?: string } {
	if (validStatuses.includes(status)) {
		return { status };
	}
	return {
		status: "planned",
		warning: `Unknown status "${status}" mapped to "planned"`,
	};
}

export function coercePriority(priority: string): {
	priority: string;
	warning?: string;
} {
	if ((VALID_PRIORITIES as readonly string[]).includes(priority)) {
		return { priority };
	}
	return {
		priority: "no-priority",
		warning: `Unknown priority "${priority}" mapped to "no-priority"`,
	};
}
