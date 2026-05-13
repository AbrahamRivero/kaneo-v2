import type { Project } from "../../domain";
import type { CreateProjectInput, ProjectRepository } from "../ports";

export class CreateProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(input: CreateProjectInput): Promise<Project> {
		return this.projectRepository.create(input);
	}
}
