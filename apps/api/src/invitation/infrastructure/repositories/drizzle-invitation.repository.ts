import { and, eq, gt } from "drizzle-orm";
import db from "../../../database";
import {
	invitationTable,
	userTable,
	workspaceTable,
} from "../../../database/schema";
import type { InvitationRepository } from "../../application/ports/invitation-repository.port";
import type { Invitation, InvitationWithDetails } from "../../domain";
import {
	mapInvitationToEntity,
	mapInvitationWithDetailsToEntity,
} from "../mappers/invitation.mapper";

export class DrizzleInvitationRepository implements InvitationRepository {
	async findById(id: string): Promise<Invitation | null> {
		const invitation = await db.query.invitationTable.findFirst({
			where: eq(invitationTable.id, id),
		});
		return invitation ? mapInvitationToEntity(invitation) : null;
	}

	async findByEmailAndStatus(
		email: string,
		status: string,
	): Promise<InvitationWithDetails[]> {
		const now = new Date();

		try {
			const result = await db
				.select({
					id: invitationTable.id,
					email: invitationTable.email,
					workspaceId: invitationTable.workspaceId,
					workspaceName: workspaceTable.name,
					inviterName: userTable.name,
					expiresAt: invitationTable.expiresAt,
					createdAt: invitationTable.createdAt,
					status: invitationTable.status,
					role: invitationTable.role,
					teamId: invitationTable.teamId,
					inviterId: invitationTable.inviterId,
				})
				.from(invitationTable)
				.innerJoin(
					workspaceTable,
					eq(invitationTable.workspaceId, workspaceTable.id),
				)
				.innerJoin(userTable, eq(invitationTable.inviterId, userTable.id))
				.where(
					and(
						eq(invitationTable.email, email),
						eq(invitationTable.status, status),
						gt(invitationTable.expiresAt, now),
					),
				)
				.orderBy(invitationTable.createdAt);

			return result.map(mapInvitationWithDetailsToEntity);
		} catch (error) {
			console.error("Error in findByEmailAndStatus:", error);
			throw error;
		}
	}

	async findWithDetailsById(id: string): Promise<InvitationWithDetails | null> {
		const result = await db
			.select({
				id: invitationTable.id,
				email: invitationTable.email,
				workspaceId: invitationTable.workspaceId,
				workspaceName: workspaceTable.name,
				inviterName: userTable.name,
				expiresAt: invitationTable.expiresAt,
				createdAt: invitationTable.createdAt,
				status: invitationTable.status,
				role: invitationTable.role,
				teamId: invitationTable.teamId,
				inviterId: invitationTable.inviterId,
			})
			.from(invitationTable)
			.innerJoin(
				workspaceTable,
				eq(invitationTable.workspaceId, workspaceTable.id),
			)
			.innerJoin(userTable, eq(invitationTable.inviterId, userTable.id))
			.where(eq(invitationTable.id, id))
			.limit(1);

		if (!result[0]) {
			return null;
		}

		return mapInvitationWithDetailsToEntity(result[0]);
	}
}

export const invitationRepository = new DrizzleInvitationRepository();
