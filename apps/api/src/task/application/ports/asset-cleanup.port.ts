export interface AssetCleanupPort {
	cleanupOrphanedAssets(
		oldContent: string | null | undefined,
		newContent: string | null | undefined,
		taskId: string,
	): Promise<void>;

	getTaskAssetKeys(taskId: string): Promise<string[]>;

	deleteS3Keys(keys: string[]): Promise<void>;
}
