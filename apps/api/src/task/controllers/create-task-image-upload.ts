import { createTaskUseCases } from "../application";

const { createTaskImageUpload } = createTaskUseCases();

async function createTaskImageUploadHandler(params: {
	taskId: string;
	filename: string;
	contentType: string;
	size: number;
	surface: "description" | "comment";
}) {
	return createTaskImageUpload.execute(params);
}

export default createTaskImageUploadHandler;
