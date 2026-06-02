import { publishEvent } from "../../../events";
import type { CreateRecurringTaskInput, RecurringTask } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class CreateRecurringTaskUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(input: CreateRecurringTaskInput): Promise<RecurringTask> {
		const task = await this.recurringTaskRepository.create(input);

		await publishEvent("recurring_task.created", {
			recurringTaskId: task.id,
			projectId: input.projectId,
			userId: input.createdBy ?? "",
		});

		return task;
	}
}
