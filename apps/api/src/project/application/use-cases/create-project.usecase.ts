import type { EventPublisher } from "../../../common/ports/event-publisher.port";
import type { Project } from "../../domain";
import type { CreateProjectInput, ProjectRepository } from "../ports";

export class CreateProjectUseCase {
	constructor(
		private readonly projectRepository: ProjectRepository,
		private readonly eventPublisher: EventPublisher,
	) {}

	async execute(input: CreateProjectInput): Promise<Project> {
		const project = await this.projectRepository.create(input);

		await this.eventPublisher.publish("project.created", {
			projectId: project.id,
			workspaceId: project.workspaceId,
			name: project.name,
			slug: project.slug,
			userId: input.userId,
		});

		return project;
	}
}
