import { HTTPException } from "hono/http-exception";
import {
	createTaskImageUploadUrl,
	validateTaskAssetUploadInput,
} from "../../../storage/s3";
import type { TaskRepository } from "../ports/task-repository.port";

export class CreateTaskImageUploadUseCase {
	constructor(private taskRepository: TaskRepository) {}

	async execute(params: {
		taskId: string;
		filename: string;
		contentType: string;
		size: number;
		surface: "description" | "comment";
	}) {
		try {
			validateTaskAssetUploadInput(params.contentType, params.size);
		} catch (error) {
			throw new HTTPException(400, {
				message:
					error instanceof Error
						? error.message
						: "Invalid image upload request",
			});
		}

		const taskContext = await this.taskRepository.findTaskContext(
			params.taskId,
		);

		if (!taskContext) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		try {
			const upload = await createTaskImageUploadUrl({
				workspaceId: taskContext.workspaceId,
				projectId: taskContext.projectId,
				taskId: taskContext.taskId,
				surface: params.surface,
				filename: params.filename,
				contentType: params.contentType,
			});

			return upload;
		} catch (error) {
			throw new HTTPException(503, {
				message:
					error instanceof Error
						? error.message
						: "Image uploads are not configured",
			});
		}
	}
}
