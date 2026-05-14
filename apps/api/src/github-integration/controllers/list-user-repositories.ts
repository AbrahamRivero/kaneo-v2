import { ListUserRepositoriesUseCase } from "../application/use-cases";
import { githubService } from "../infrastructure/services/github.service";

async function listUserRepositories() {
	const useCase = new ListUserRepositoriesUseCase(githubService);
	return useCase.execute();
}

export default listUserRepositories;
