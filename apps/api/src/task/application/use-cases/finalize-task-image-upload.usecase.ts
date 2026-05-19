import { HTTPException } from "hono/http-exception";
import {
	assertTaskImageKeyMatchesContext,
	isImageContentType,
	validateTaskAssetUploadInput,
} from "../../../storage/s3";
import type { TaskRepository } from "../ports/task-repository.port";

export class FinalizeTaskImageUploadUseCase {
	constructor(private taskRepository: TaskRepository) {}

	async execute(params: {
		taskId: string;
		key: string;
		filename: string;
		contentType: string;
		size: number;
		surface: "description" | "comment";
		userId: string | null;
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

		const normalizedKey = params.key.trim();
		if (
			!assertTaskImageKeyMatchesContext(normalizedKey, {
				workspaceId: taskContext.workspaceId,
				projectId: taskContext.projectId,
				taskId: taskContext.taskId,
				surface: params.surface,
			})
		) {
			throw new HTTPException(400, {
				message: "Image upload key does not match the task context.",
			});
		}

		return this.taskRepository.upsertTaskAsset({
			workspaceId: taskContext.workspaceId,
			projectId: taskContext.projectId,
			taskId: taskContext.taskId,
			objectKey: normalizedKey,
			filename: params.filename,
			mimeType: params.contentType,
			size: params.size,
			kind: isImageContentType(params.contentType) ? "image" : "attachment",
			surface: params.surface,
			createdBy: params.userId,
		});
	}
}
