import type { ReactNode } from "react";
import { useFeatureEnabled } from "@/hooks/queries/features/use-workspace-features";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";

type FeatureGateProps = {
	featureKey: string;
	children: ReactNode;
	fallback?: ReactNode;
};

export function FeatureGate({
	featureKey,
	children,
	fallback,
}: FeatureGateProps) {
	const { data: workspace } = useActiveWorkspace();
	const enabled = useFeatureEnabled(workspace?.id ?? "", featureKey);

	if (!enabled) return fallback ?? null;

	return <>{children}</>;
}
