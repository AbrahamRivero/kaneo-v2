import { GlobalSearchUseCase } from "../application/use-cases";
import type { SearchParams } from "../domain";
import { searchRepository } from "../infrastructure/repositories/drizzle-search.repository";

const globalSearchUseCase = new GlobalSearchUseCase(searchRepository);

export default async function globalSearch(params: SearchParams) {
	return globalSearchUseCase.execute(params);
}
