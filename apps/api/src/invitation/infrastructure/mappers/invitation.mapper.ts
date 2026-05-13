import type { InferSelectModel } from "drizzle-orm";
import type { invitationTable } from "../../../database/schema";
import type { Invitation, InvitationWithDetails } from "../../domain";

type InvitationRow = InferSelectModel<typeof invitationTable>;

export function mapInvitationToEntity(row: InvitationRow): Invitation {
	return {
		id: row.id,
		workspaceId: row.workspaceId,
		email: row.email,
		role: row.role,
		teamId: row.teamId,
		status: row.status as Invitation["status"],
		expiresAt: row.expiresAt,
		createdAt: row.createdAt,
		inviterId: row.inviterId,
	};
}

export function mapInvitationWithDetailsToEntity(row: {
	id: string;
	email: string;
	workspaceId: string;
	workspaceName: string;
	inviterName: string;
	expiresAt: Date;
	createdAt: Date;
	status: string;
	role: string | null;
	teamId: string | null;
	inviterId: string;
}): InvitationWithDetails {
	return {
		id: row.id,
		workspaceId: row.workspaceId,
		email: row.email,
		role: row.role,
		teamId: row.teamId,
		status: row.status as Invitation["status"],
		expiresAt: row.expiresAt,
		createdAt: row.createdAt,
		inviterId: row.inviterId,
		workspaceName: row.workspaceName,
		inviterName: row.inviterName,
	};
}
