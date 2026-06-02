import { createTemplateUseCases } from "../application";

const { listTemplates } = createTemplateUseCases();

async function listTemplatesController(workspaceId: string) {
	return listTemplates.execute(workspaceId);
}

export default listTemplatesController;
