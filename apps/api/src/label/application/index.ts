export * from "./ports";
export * from "./use-cases";

import { publishEvent } from "../../events";
import {
	removeLabelFromGitea,
	syncLabelToGitea,
} from "../../plugins/gitea/utils/sync-label-to-gitea";
import {
	removeLabelFromGitHub,
	syncLabelToGitHub,
} from "../../plugins/github/utils/sync-label-to-github";
import { DrizzleLabelRepository } from "../infrastructure/repositories/drizzle-label.repository";
import {
	AssignLabelToTaskUseCase,
	CreateLabelUseCase,
	DeleteLabelUseCase,
	GetLabelsByTaskUseCase,
	GetLabelsByWorkspaceUseCase,
	GetLabelUseCase,
	UnassignLabelFromTaskUseCase,
	UpdateLabelUseCase,
} from "./use-cases";

const labelRepository = new DrizzleLabelRepository();

const eventPublisher = {
	publish: async (eventType: string, data: unknown) => {
		await publishEvent(eventType, data);
	},
};

const integrations = {
	syncToGitHub: (taskId: string, name: string, color: string) =>
		syncLabelToGitHub(taskId, name, color),
	syncToGitea: (taskId: string, name: string, color: string) =>
		syncLabelToGitea(taskId, name, color),
	removeFromGitHub: (taskId: string, name: string) =>
		removeLabelFromGitHub(taskId, name),
	removeFromGitea: (taskId: string, name: string) =>
		removeLabelFromGitea(taskId, name),
};

export const createLabelUseCases = () => ({
	getLabel: new GetLabelUseCase(labelRepository),
	getLabelsByWorkspace: new GetLabelsByWorkspaceUseCase(labelRepository),
	getLabelsByTask: new GetLabelsByTaskUseCase(labelRepository),
	createLabel: new CreateLabelUseCase(
		labelRepository,
		eventPublisher,
		integrations,
	),
	updateLabel: new UpdateLabelUseCase(labelRepository),
	deleteLabel: new DeleteLabelUseCase(
		labelRepository,
		eventPublisher,
		integrations,
	),
	assignLabelToTask: new AssignLabelToTaskUseCase(
		labelRepository,
		eventPublisher,
		integrations,
	),
	unassignLabelFromTask: new UnassignLabelFromTaskUseCase(
		labelRepository,
		eventPublisher,
		integrations,
	),
});
