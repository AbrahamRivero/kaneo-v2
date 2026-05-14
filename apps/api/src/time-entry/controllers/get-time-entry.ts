import { HTTPException } from "hono/http-exception";
import { GetTimeEntryUseCase } from "../application/use-cases";
import { timeEntryRepository } from "../infrastructure/repositories/drizzle-time-entry.repository";

const getTimeEntryUseCase = new GetTimeEntryUseCase(timeEntryRepository);

async function getTimeEntryController(id: string) {
	const entry = await getTimeEntryUseCase.execute(id);
	if (!entry) {
		throw new HTTPException(404, { message: "Time entry not found" });
	}
	return entry;
}

export default getTimeEntryController;
