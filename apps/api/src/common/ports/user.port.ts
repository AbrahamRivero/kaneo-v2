export interface User {
	id: string;
	name: string;
	email: string;
	image: string | null;
	createdAt: Date;
}

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
}
