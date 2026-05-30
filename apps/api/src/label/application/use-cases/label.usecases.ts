import { HTTPException } from "hono/http-exception";
import type { Label, LabelWithRelations } from "../../domain";
import type { LabelRepository } from "../ports/label-repository.port";

export class GetLabelUseCase {
	constructor(private labelRepository: LabelRepository) {}

	async execute(id: string): Promise<Label> {
		const label = await this.labelRepository.findById(id);
		if (!label) {
			throw new HTTPException(404, { message: "Label not found" });
		}
		return label;
	}
}

export class GetLabelsByWorkspaceUseCase {
	constructor(private labelRepository: LabelRepository) {}

	async execute(workspaceId: string): Promise<Label[]> {
		return this.labelRepository.findByWorkspaceId(workspaceId);
	}
}

export class GetLabelsByTaskUseCase {
	constructor(private labelRepository: LabelRepository) {}

	async execute(taskId: string): Promise<Label[]> {
		return this.labelRepository.findByTaskId(taskId);
	}
}

export class CreateLabelUseCase {
	constructor(
		private labelRepository: LabelRepository,
		private eventPublisher: {
			publish: (eventType: string, data: unknown) => Promise<void>;
		},
		private integrations: {
			syncToGitHub: (
				taskId: string,
				name: string,
				color: string,
			) => Promise<void>;
			syncToGitea: (
				taskId: string,
				name: string,
				color: string,
			) => Promise<void>;
		},
	) {}

	async execute(input: {
		name: string;
		color: string;
		taskId?: string;
		workspaceId: string;
		currentUserId: string;
	}): Promise<LabelWithRelations> {
		const repoInput = {
			name: input.name,
			color: input.color,
			taskId: input.taskId,
			workspaceId: input.workspaceId,
			currentUserId: input.currentUserId,
		};
		const label = await this.labelRepository.create(repoInput);

		if (label.taskId && input.taskId) {
			this.integrations
				.syncToGitHub(input.taskId, label.name, label.color)
				.catch(() => {});
			this.integrations
				.syncToGitea(input.taskId, label.name, label.color)
				.catch(() => {});

			await this.eventPublisher.publish("task.label_created", {
				projectId: label.task?.projectId,
				taskId: label.taskId,
				userId: input.currentUserId,
				type: "label_created",
			});
		}

		return label;
	}
}

export class UpdateLabelUseCase {
	constructor(private labelRepository: LabelRepository) {}

	async execute(input: {
		id: string;
		name: string;
		color: string;
	}): Promise<Label> {
		const existingLabel = await this.labelRepository.findById(input.id);
		if (!existingLabel) {
			throw new HTTPException(404, { message: "Label not found" });
		}

		const [updatedLabel] = await this.labelRepository.update(input);
		if (!updatedLabel) {
			throw new HTTPException(500, { message: "Failed to update label" });
		}
		return updatedLabel;
	}
}

export class DeleteLabelUseCase {
	constructor(
		private labelRepository: LabelRepository,
		private eventPublisher: {
			publish: (eventType: string, data: unknown) => Promise<void>;
		},
		private integrations: {
			removeFromGitHub: (taskId: string, name: string) => Promise<void>;
		},
	) {}

	async execute(input: { id: string; userId: string }): Promise<Label> {
		const label = await this.labelRepository.findById(input.id);
		if (!label) {
			throw new HTTPException(404, { message: "Label not found" });
		}

		if (!label.taskId) {
			throw new HTTPException(400, {
				message: "Label is not associated with a task",
			});
		}

		const task = await this.labelRepository.findTaskById(label.taskId);
		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const deletedLabel = await this.labelRepository.delete(input.id);

		if (deletedLabel.taskId) {
			this.integrations
				.removeFromGitHub(deletedLabel.taskId, deletedLabel.name)
				.catch(() => {});
		}

		await this.eventPublisher.publish("task.label_deleted", {
			label: deletedLabel,
			task,
			projectId: task.projectId,
			taskId: task.id,
			userId: input.userId,
			type: "label_deleted",
		});

		return deletedLabel;
	}
}

export class AssignLabelToTaskUseCase {
	constructor(
		private labelRepository: LabelRepository,
		private eventPublisher: {
			publish: (eventType: string, data: unknown) => Promise<void>;
		},
		private integrations: {
			syncToGitHub: (
				taskId: string,
				name: string,
				color: string,
			) => Promise<void>;
			syncToGitea: (
				taskId: string,
				name: string,
				color: string,
			) => Promise<void>;
			removeFromGitHub: (taskId: string, name: string) => Promise<void>;
			removeFromGitea: (taskId: string, name: string) => Promise<void>;
		},
	) {}

	async execute(input: {
		labelId: string;
		taskId: string;
		userId: string;
	}): Promise<Label> {
		const label = await this.labelRepository.findById(input.labelId);
		if (!label) {
			throw new HTTPException(404, { message: "Label not found" });
		}

		const task = await this.labelRepository.findTaskById(input.taskId);
		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		if (label.workspaceId && label.workspaceId !== task.workspaceId) {
			throw new HTTPException(400, {
				message: "Label and task must belong to the same workspace",
			});
		}

		const updatedLabel = await this.labelRepository.assignToTask(
			input.labelId,
			input.taskId,
		);

		if (label.taskId && label.taskId !== input.taskId) {
			this.integrations
				.removeFromGitHub(label.taskId, label.name)
				.catch(() => {});
			this.integrations
				.removeFromGitea(label.taskId, label.name)
				.catch(() => {});
		}

		this.integrations
			.syncToGitHub(input.taskId, updatedLabel.name, updatedLabel.color)
			.catch(() => {});
		this.integrations
			.syncToGitea(input.taskId, updatedLabel.name, updatedLabel.color)
			.catch(() => {});

		await this.eventPublisher.publish("task.label_assigned", {
			label: updatedLabel,
			task,
			projectId: task.projectId,
			taskId: task.id,
			userId: input.userId,
			type: "label_assigned",
		});

		return updatedLabel;
	}
}

export class UnassignLabelFromTaskUseCase {
	constructor(
		private labelRepository: LabelRepository,
		private eventPublisher: {
			publish: (eventType: string, data: unknown) => Promise<void>;
		},
		private integrations: {
			removeFromGitHub: (taskId: string, name: string) => Promise<void>;
		},
	) {}

	async execute(input: { labelId: string; userId: string }): Promise<Label> {
		const label = await this.labelRepository.findById(input.labelId);
		if (!label) {
			throw new HTTPException(404, { message: "Label not found" });
		}

		if (!label.taskId) {
			throw new HTTPException(400, {
				message: "Label is not assigned to a task",
			});
		}

		const task = await this.labelRepository.findTaskById(label.taskId);
		if (!task) {
			throw new HTTPException(404, { message: "Task not found" });
		}

		const updatedLabel = await this.labelRepository.unassignFromTask(
			input.labelId,
		);

		this.integrations
			.removeFromGitHub(label.taskId, label.name)
			.catch(() => {});

		await this.eventPublisher.publish("task.label_unassigned", {
			label: updatedLabel,
			task,
			projectId: task.projectId,
			taskId: label.taskId,
			userId: input.userId,
			type: "label_unassigned",
		});

		return updatedLabel;
	}
}
