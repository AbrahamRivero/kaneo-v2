import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FeatureGate } from "@/components/feature-gate";
import PageTitle from "@/components/page-title";
import CreateTemplateModal from "@/components/shared/modals/create-template-modal";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import icons from "@/constants/project-icons";
import { useDeleteTemplate } from "@/hooks/mutations/template/use-delete-template";
import { useListTemplates } from "@/hooks/queries/template/use-list-templates";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/settings/workspace/templates",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const { data: workspace } = useActiveWorkspace();
	const workspaceId = workspace?.id ?? "";
	const { data: templates, isLoading } = useListTemplates(workspaceId);
	const deleteTemplateMutation = useDeleteTemplate(workspaceId);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const handleDelete = async (templateId: string) => {
		try {
			await deleteTemplateMutation.mutateAsync(templateId);
		} catch {
			// Toast error is handled by the hook
		}
	};

	return (
		<FeatureGate featureKey="templates">
			<PageTitle title={t("templates:pageTitle")} />
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">{t("templates:title")}</h1>
					<p className="text-muted-foreground text-sm">
						{t("templates:description")}
					</p>
				</div>

				<div className="flex justify-end">
					<CreateTemplateModal
						open={isCreateOpen}
						onClose={() => setIsCreateOpen(false)}
					/>
					<Button size="sm" onClick={() => setIsCreateOpen(true)}>
						{t("templates:create.trigger")}
					</Button>
				</div>

				{isLoading && (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-24 w-full" />
						))}
					</div>
				)}

				{!isLoading && (!templates || templates.length === 0) && (
					<div className="flex flex-col items-center gap-2 py-16 text-center">
						<p className="text-sm text-muted-foreground">
							{t("templates:empty.description")}
						</p>
					</div>
				)}

				{!isLoading && templates && templates.length > 0 && (
					<div className="space-y-3">
						{templates.map((template) => {
							const TemplateIcon =
								icons[template.icon as keyof typeof icons] || icons.Layout;
							const isBuiltIn = !template.workspaceId;

							return (
								<Card key={template.id}>
									<CardHeader className="flex flex-row items-start gap-4 pb-3">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
											<TemplateIcon className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="flex-1 space-y-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-base">
													{template.name}
												</CardTitle>
												{isBuiltIn && (
													<span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
														{t("templates:builtIn")}
													</span>
												)}
											</div>
											<CardDescription className="text-xs">
												{template.description ?? t("templates:noDescription")}
											</CardDescription>
										</div>
										{!isBuiltIn && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="ghost"
															size="icon-xs"
															className="text-muted-foreground hover:text-destructive"
															onClick={() => handleDelete(template.id)}
															loading={deleteTemplateMutation.isPending}
														>
															<Trash2 className="size-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														{t("templates:deleteTooltip")}
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</CardHeader>
									<CardContent className="pb-3">
										<div className="flex flex-wrap gap-1">
											{template.columns.map((col) => (
												<span
													key={col.id}
													className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
												>
													{col.name}
												</span>
											))}
										</div>
										{template.tasks.length > 0 && (
											<p className="mt-2 text-xs text-muted-foreground">
												{t("templates:createProject.sampleTaskCount", {
													count: template.tasks.length,
												})}
											</p>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</FeatureGate>
	);
}
