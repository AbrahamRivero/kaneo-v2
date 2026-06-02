import { HTTPException } from "hono/http-exception";
import { publishEvent } from "../../../events";
import type { RecurringTask } from "../../domain";
import type { RecurringTaskRepository } from "../ports/recurring-task-repository.port";

export class DeleteRecurringTaskUseCase {
	constructor(private recurringTaskRepository: RecurringTaskRepository) {}

	async execute(
		recurringTaskId: string,
		userId?: string,
	): Promise<RecurringTask> {
		const existing =
			await this.recurringTaskRepository.findById(recurringTaskId);

		if (!existing) {
			throw new HTTPException(404, {
				message: "Recurring task not found",
			});
		}

		const task = await this.recurringTaskRepository.delete(recurringTaskId);

		await publishEvent("recurring_task.deleted", {
			recurringTaskId,
			projectId: task.projectId,
			userId: userId ?? "",
		});

		return task;
	}
}
