import { useNavigate } from "@tanstack/react-router";
import { Building2, ChevronRight, DollarSign } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useFeatureEnabled } from "@/hooks/queries/features/use-workspace-features";
import { usePendingInvitations } from "@/hooks/queries/invitation/use-pending-invitations";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";

export function NavMain() {
	const { t } = useTranslation();
	const { data: workspace } = useActiveWorkspace();
	const navigate = useNavigate();
	const { data: invitations = [] } = usePendingInvitations();
	const budgetsEnabled = useFeatureEnabled(workspace?.id ?? "", "budgets");
	const suppliersEnabled = useFeatureEnabled(workspace?.id ?? "", "suppliers");

	if (!workspace) return null;

	const pendingCount = invitations.length;

	const navItems: {
		title: string;
		url: string;
		isActive: boolean;
		badge: number | null;
		Icon: React.ComponentType<{ className?: string }> | null;
	}[] = [
		{
			title: t("navigation:sidebar.projects"),
			url: `/dashboard/workspace/${workspace.id}`,
			isActive:
				window.location.pathname === `/dashboard/workspace/${workspace.id}`,
			badge: null,
			Icon: null,
		},
		{
			title: t("navigation:sidebar.members"),
			url: `/dashboard/workspace/${workspace.id}/members`,
			isActive:
				window.location.pathname ===
				`/dashboard/workspace/${workspace.id}/members`,
			badge: null,
			Icon: null,
		},
		{
			title: t("navigation:sidebar.invitations"),
			url: "/dashboard/invitations",
			isActive: window.location.pathname === "/dashboard/invitations",
			badge: pendingCount > 0 ? pendingCount : null,
			Icon: null,
		},
		...(budgetsEnabled
			? [
					{
						title: "Budgets",
						url: `/dashboard/workspace/${workspace.id}/budgets`,
						isActive:
							window.location.pathname ===
							`/dashboard/workspace/${workspace.id}/budgets`,
						badge: null,
						Icon: DollarSign,
					},
				]
			: []),
		...(suppliersEnabled
			? [
					{
						title: "Suppliers",
						url: `/dashboard/workspace/${workspace.id}/suppliers`,
						isActive:
							window.location.pathname ===
								`/dashboard/workspace/${workspace.id}/suppliers` ||
							window.location.pathname.startsWith(
								`/dashboard/workspace/${workspace.id}/suppliers/`,
							),
						badge: null,
						Icon: Building2,
					},
				]
			: []),
	];

	return (
		<Collapsible defaultOpen className="group/collapsible">
			<SidebarGroup className="gap-1 p-2">
				<CollapsibleTrigger
					className="data-panel-open:[&_svg]:rotate-90"
					render={
						<SidebarGroupLabel className="h-7 cursor-pointer justify-between px-0 text-sidebar-accent-foreground" />
					}
				>
					<span>{t("navigation:sidebar.overview")}</span>
					<ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60 transition-transform duration-200" />
				</CollapsibleTrigger>
				<CollapsiblePanel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-0.5">
							{navItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										tooltip={item.title}
										isActive={item.isActive}
										size="default"
										className="h-8 ps-3.5 text-sm hover:bg-transparent hover:text-sidebar-accent-foreground active:bg-transparent"
										onClick={() => navigate({ to: item.url })}
									>
										{item.Icon && <item.Icon className="size-4" />}
										<span>{item.title}</span>
										{item.badge !== null && (
											<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-sm border border-sidebar-border/60 px-1 text-[11px] font-medium text-sidebar-foreground/80">
												{item.badge}
											</span>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsiblePanel>
			</SidebarGroup>
		</Collapsible>
	);
}
