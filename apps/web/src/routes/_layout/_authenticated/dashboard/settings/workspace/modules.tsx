import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import PageTitle from "@/components/page-title";
import { Switch } from "@/components/ui/switch";
import {
	type FeatureModule,
	getFeatureRegistry,
} from "@/fetchers/features/get-workspace-features";
import { useUpdateWorkspaceFeatures } from "@/hooks/mutations/features/use-update-workspace-features";
import { useWorkspaceFeatures } from "@/hooks/queries/features/use-workspace-features";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/settings/workspace/modules",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspace } = useActiveWorkspace();
	const { isOwner, isAdmin } = useWorkspacePermission();
	const canManage = isOwner || isAdmin;

	const workspaceId = workspace?.id ?? "";

	const { data: registry, isLoading: registryLoading } = useQuery({
		queryKey: ["feature-registry"],
		queryFn: getFeatureRegistry,
	});

	const { data: currentFeatures, isLoading: featuresLoading } =
		useWorkspaceFeatures(workspaceId);

	const { mutateAsync: updateFeatures, isPending: isSaving } =
		useUpdateWorkspaceFeatures(workspaceId);

	const isEnabled = useCallback(
		(featureKey: string) => {
			if (!currentFeatures) return false;
			const f = currentFeatures.find((cf) => cf.key === featureKey);
			return f?.enabled ?? false;
		},
		[currentFeatures],
	);

	const handleToggle = useCallback(
		async (featureKey: string, currentEnabled: boolean) => {
			try {
				await updateFeatures([{ key: featureKey, enabled: !currentEnabled }]);
				toast.success("Module updated");
			} catch {
				toast.error("Failed to update module");
			}
		},
		[updateFeatures],
	);

	const categoryLabels: Record<string, string> = useMemo(
		() => ({
			finance: "Finance",
			operations: "Operations",
			planning: "Planning",
			collaboration: "Collaboration",
			automation: "Automation",
		}),
		[],
	);

	const isLoading = registryLoading || featuresLoading;

	return (
		<>
			<PageTitle title="Modules" />
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">Modules</h1>
					<p className="text-muted-foreground text-sm">
						Enable or disable optional features for this workspace
					</p>
				</div>

				{isLoading && (
					<p className="text-muted-foreground">Loading modules...</p>
				)}

				{!isLoading &&
					registry &&
					Object.entries(registry).map(([category, features]) => (
						<div key={category} className="space-y-4">
							<h2 className="text-md font-medium capitalize">
								{categoryLabels[category] ?? category}
							</h2>
							<div className="space-y-2">
								{features.map((feature: FeatureModule) => {
									const enabled = isEnabled(feature.key);
									return (
										<div
											key={feature.key}
											className="flex items-center justify-between border border-border rounded-md p-4 bg-sidebar"
										>
											<div className="space-y-0.5">
												<p className="text-sm font-medium">{feature.name}</p>
												<p className="text-xs text-muted-foreground">
													{feature.description}
												</p>
											</div>
											<Switch
												checked={enabled}
												disabled={!canManage || isSaving}
												onCheckedChange={() =>
													handleToggle(feature.key, enabled)
												}
											/>
										</div>
									);
								})}
							</div>
						</div>
					))}
			</div>
		</>
	);
}
