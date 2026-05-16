import { createId } from "@paralleldrive/cuid2";
import { and, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { notificationTable } from "../../../database/schema";
import type { NotificationRepository } from "../../application/ports/notification-repository.port";
import type { CreateNotificationInput } from "../../domain";

export class DrizzleNotificationRepository implements NotificationRepository {
	async create(input: CreateNotificationInput) {
		const [notification] = await db
			.insert(notificationTable)
			.values({
				id: createId(),
				userId: input.userId,
				title: input.title ?? null,
				content: input.content ?? null,
				type: input.type || "info",
				eventData: input.eventData ?? null,
				resourceId: input.resourceId || null,
				resourceType: input.resourceType || null,
			})
			.returning();

		if (!notification) {
			throw new Error("Failed to create notification");
		}

		return notification;
	}

	async getByUserId(userId: string) {
		const notifications = await db
			.select()
			.from(notificationTable)
			.where(eq(notificationTable.userId, userId))
			.orderBy(desc(notificationTable.createdAt))
			.limit(50);

		return notifications;
	}

	async markAsRead(id: string, userId: string) {
		const [notification] = await db
			.update(notificationTable)
			.set({ isRead: true })
			.where(
				and(eq(notificationTable.id, id), eq(notificationTable.userId, userId)),
			)
			.returning();

		if (!notification) {
			throw new HTTPException(404, {
				message: "Notification not found",
			});
		}

		return notification;
	}

	async markAllAsRead(userId: string) {
		await db
			.update(notificationTable)
			.set({ isRead: true })
			.where(eq(notificationTable.userId, userId));
	}

	async clearAll(userId: string) {
		await db
			.delete(notificationTable)
			.where(eq(notificationTable.userId, userId));
	}
}

export const notificationRepository = new DrizzleNotificationRepository();
