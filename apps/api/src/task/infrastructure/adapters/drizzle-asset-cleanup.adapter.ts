import {
	deleteOrphanedAssets,
	deleteS3Keys,
	getTaskAssetKeys,
} from "../../../storage/cleanup-assets";
import type { AssetCleanupPort } from "../../application/ports/asset-cleanup.port";

export class DrizzleAssetCleanupAdapter implements AssetCleanupPort {
	async cleanupOrphanedAssets(
		oldContent: string | null | undefined,
		newContent: string | null | undefined,
		taskId: string,
	): Promise<void> {
		await deleteOrphanedAssets(oldContent, newContent, { taskId });
	}

	async getTaskAssetKeys(taskId: string): Promise<string[]> {
		return getTaskAssetKeys(taskId);
	}

	async deleteS3Keys(keys: string[]): Promise<void> {
		await deleteS3Keys(keys);
	}
}

export const assetCleanupAdapter = new DrizzleAssetCleanupAdapter();
