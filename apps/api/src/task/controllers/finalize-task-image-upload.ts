import { createTaskUseCases } from "../application";

const { finalizeTaskImageUpload } = createTaskUseCases();

async function finalizeTaskImageUploadHandler(params: {
	taskId: string;
	key: string;
	filename: string;
	contentType: string;
	size: number;
	surface: "description" | "comment";
	userId: string | null;
}) {
	return finalizeTaskImageUpload.execute(params);
}

export default finalizeTaskImageUploadHandler;
