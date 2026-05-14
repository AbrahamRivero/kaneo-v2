import type { Activity } from "../../domain";

type ActivityRow = {
	id: string;
	taskId: string;
	type: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string | null;
	content: string | null;
	eventData: Record<string, unknown> | null;
	externalUserName: string | null;
	externalUserAvatar: string | null;
	externalSource: string | null;
	externalUrl: string | null;
};

export function mapToActivity(row: ActivityRow): Activity {
	return {
		id: row.id,
		taskId: row.taskId,
		type: row.type,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		userId: row.userId,
		content: row.content,
		eventData: row.eventData,
		externalUserName: row.externalUserName,
		externalUserAvatar: row.externalUserAvatar,
		externalSource: row.externalSource,
		externalUrl: row.externalUrl,
	};
}
