import { asc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../../database";
import { commentTable, userTable } from "../../../database/schema";
import type {
	CommentRepository,
	CreateCommentInput,
} from "../../application/ports";
import type { Comment, CommentWithUser } from "../../domain";
import { mapToComment, mapToCommentWithUser } from "../mappers/comment.mapper";

export class DrizzleCommentRepository implements CommentRepository {
	async findByTaskId(taskId: string): Promise<CommentWithUser[]> {
		const rows = await db
			.select({
				id: commentTable.id,
				taskId: commentTable.taskId,
				userId: commentTable.userId,
				content: commentTable.content,
				createdAt: commentTable.createdAt,
				updatedAt: commentTable.updatedAt,
				userName: userTable.name,
				userImage: userTable.image,
			})
			.from(commentTable)
			.leftJoin(userTable, eq(commentTable.userId, userTable.id))
			.where(eq(commentTable.taskId, taskId))
			.orderBy(asc(commentTable.createdAt));

		return rows.map(mapToCommentWithUser);
	}

	async findById(id: string): Promise<Comment | null> {
		const row = await db.query.commentTable.findFirst({
			where: eq(commentTable.id, id),
		});

		return row ? mapToComment(row) : null;
	}

	async create(input: CreateCommentInput): Promise<Comment> {
		const [row] = await db
			.insert(commentTable)
			.values({
				taskId: input.taskId,
				userId: input.userId,
				content: input.content,
			})
			.returning();

		if (!row) {
			throw new HTTPException(500, { message: "Failed to create comment" });
		}

		return mapToComment(row);
	}

	async update(id: string, content: string): Promise<Comment> {
		const [row] = await db
			.update(commentTable)
			.set({ content })
			.where(eq(commentTable.id, id))
			.returning();

		if (!row) {
			throw new HTTPException(500, { message: "Failed to update comment" });
		}

		return mapToComment(row);
	}

	async delete(id: string): Promise<Comment> {
		const existing = await db.query.commentTable.findFirst({
			where: eq(commentTable.id, id),
		});

		if (!existing) {
			throw new HTTPException(404, { message: "Comment not found" });
		}

		await db.delete(commentTable).where(eq(commentTable.id, id));

		return mapToComment(existing);
	}
}

export const commentRepository = new DrizzleCommentRepository();
