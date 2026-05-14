import { eq } from "drizzle-orm";
import type { User, UserRepository } from "../../../common/ports/user.port";
import db from "../../../database";
import { userTable } from "../../../database/schema";

export class DrizzleUserRepository implements UserRepository {
	async findById(id: string): Promise<User | null> {
		const [user] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, id))
			.limit(1);

		if (!user) return null;

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
		};
	}

	async findByEmail(email: string): Promise<User | null> {
		const [user] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (!user) return null;

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
		};
	}
}
