import { HTTPException } from "hono/http-exception";
import { publishEvent } from "../../../events";
import type { RecurringTask, UpdateRecurringTaskInput } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class UpdateRecurringTaskUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(
		recurringTaskId: string,
		input: UpdateRecurringTaskInput & { userId?: string },
	): Promise<RecurringTask> {
		const existing =
			await this.recurringTaskRepository.findById(recurringTaskId);

		if (!existing) {
			throw new HTTPException(404, {
				message: "Recurring task not found",
			});
		}

		const { userId, ...updateData } = input;
		const task = await this.recurringTaskRepository.update(
			recurringTaskId,
			updateData,
		);

		await publishEvent("recurring_task.updated", {
			recurringTaskId,
			projectId: task.projectId,
			userId: userId ?? "",
		});

		return task;
	}
}
