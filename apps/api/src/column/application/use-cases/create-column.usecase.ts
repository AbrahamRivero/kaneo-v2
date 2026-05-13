import { HTTPException } from "hono/http-exception";
import type { Column } from "../../domain";
import type { ColumnRepository } from "../ports";

export class CreateColumnUseCase {
	constructor(private readonly columnRepository: ColumnRepository) {}

	async execute(input: {
		projectId: string;
		name: string;
		icon?: string;
		color?: string;
		isFinal?: boolean;
	}): Promise<Column> {
		const slug = toSlug(input.name);

		if (!slug) {
			throw new HTTPException(400, {
				message: "Column name must contain at least one alphanumeric character",
			});
		}

		const VIRTUAL_STATUSES = ["planned", "archived"] as const;
		if ((VIRTUAL_STATUSES as readonly string[]).includes(slug)) {
			throw new HTTPException(409, {
				message: `Column slug "${slug}" is reserved for virtual task statuses`,
			});
		}

		const exists = await this.columnRepository.existsBySlug(
			input.projectId,
			slug,
		);
		if (exists) {
			throw new HTTPException(409, {
				message: `Column with slug "${slug}" already exists in this project`,
			});
		}

		return this.columnRepository.create({
			...input,
			name: input.name,
		});
	}
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
