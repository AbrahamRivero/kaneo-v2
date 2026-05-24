import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useFeatureEnabled } from "@/hooks/queries/features/use-workspace-features";

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
	const { workspaceId } = useParams({
		from: "/dashboard/workspace/$workspaceId",
	});

	const enabled = useFeatureEnabled(workspaceId, featureKey);

	if (!enabled) return fallback ?? null;

	return <>{children}</>;
}
