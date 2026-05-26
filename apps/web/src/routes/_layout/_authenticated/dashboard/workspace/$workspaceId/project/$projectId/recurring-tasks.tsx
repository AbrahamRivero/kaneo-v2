import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import type { RecurringTaskFormData } from "@/components/shared/modals/create-recurring-task-dialog";
import RecurringTaskDialog from "@/components/shared/modals/create-recurring-task-dialog";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { RecurringTask } from "@/fetchers/recurring-tasks/list-recurring-tasks";
import { useCreateRecurringTask } from "@/hooks/mutations/recurring-tasks/use-create-recurring-task";
import { useDeleteRecurringTask } from "@/hooks/mutations/recurring-tasks/use-delete-recurring-task";
import { useUpdateRecurringTask } from "@/hooks/mutations/recurring-tasks/use-update-recurring-task";
import { useGetColumns } from "@/hooks/queries/column/use-get-columns";
import useListRecurringTasks from "@/hooks/queries/recurring-tasks/use-list-recurring-tasks";
import { useGetActiveWorkspaceUsers } from "@/hooks/queries/workspace-users/use-get-active-workspace-users";
import { formatDateMedium } from "@/lib/format";
import { getPriorityIcon } from "@/lib/priority";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/recurring-tasks",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const { projectId, workspaceId } = Route.useParams();
	const { data: tasks, isLoading } = useListRecurringTasks(projectId);
	const { data: columns = [] } = useGetColumns(projectId);
	const { data: workspaceUsers } = useGetActiveWorkspaceUsers(workspaceId);

	const createMutation = useCreateRecurringTask();
	const updateMutation = useUpdateRecurringTask();
	const deleteMutation = useDeleteRecurringTask();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<
		(RecurringTaskFormData & { id?: string }) | null
	>(null);
	const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

	const handleCreate = async (data: RecurringTaskFormData) => {
		try {
			await createMutation.mutateAsync({
				projectId,
				title: data.title,
				description: data.description,
				frequency: data.frequency,
				intervalValue: data.intervalValue,
				columnId: data.columnId,
				assigneeId: data.assigneeId,
				priority: data.priority,
				nextRunAt: data.nextRunAt,
				labelIds: data.labelIds,
				dueDateDaysOffset: data.dueDateDaysOffset,
				checklistItems: data.checklistItems,
			});
			toast.success(t("recurring:toast.created"));
			setDialogOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("recurring:toast.createError"),
			);
		}
	};

	const handleUpdate = async (data: RecurringTaskFormData) => {
		if (!editingTask?.id) return;
		try {
			await updateMutation.mutateAsync({
				projectId,
				recurringTaskId: editingTask.id,
				title: data.title,
				description: data.description ?? null,
				frequency: data.frequency,
				intervalValue: data.intervalValue,
				columnId: data.columnId ?? null,
				assigneeId: data.assigneeId ?? null,
				priority: data.priority ?? null,
				nextRunAt: data.nextRunAt,
				labelIds: data.labelIds ?? null,
				dueDateDaysOffset: data.dueDateDaysOffset ?? null,
				checklistItems: data.checklistItems,
			});
			toast.success(t("recurring:toast.updated"));
			setEditingTask(null);
			setDialogOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("recurring:toast.updateError"),
			);
		}
	};

	const handleDelete = async () => {
		if (!deletingTaskId) return;
		try {
			await deleteMutation.mutateAsync({
				recurringTaskId: deletingTaskId,
				projectId,
			});
			toast.success(t("recurring:toast.deleted"));
			setDeletingTaskId(null);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("recurring:toast.deleteError"),
			);
		}
	};

	const handleToggleActive = async (
		recurringTaskId: string,
		isActive: boolean,
	) => {
		try {
			await updateMutation.mutateAsync({
				projectId,
				recurringTaskId,
				isActive: !isActive,
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("recurring:toast.updateError"),
			);
		}
	};

	const scheduleLabel = (freq: string, intervalVal: number): string => {
		if (intervalVal > 1) {
			return `${t("recurring:schedule.every")} ${intervalVal} ${t(`recurring:schedule.${freq}`, { count: intervalVal })}`;
		}
		switch (freq) {
			case "daily":
				return t("recurring:frequency.daily");
			case "weekly":
				return t("recurring:frequency.weekly");
			case "monthly":
				return t("recurring:frequency.monthly");
			default:
				return freq;
		}
	};

	const openEditDialog = (task: RecurringTask) => {
		setEditingTask({
			id: task.id,
			title: task.title,
			description: task.description ?? "",
			frequency: task.frequency,
			intervalValue: task.intervalValue,
			priority: task.priority ?? "no-priority",
			columnId: task.columnId ?? "",
			assigneeId: task.assigneeId ?? "",
			nextRunAt: task.nextRunAt,
			labelIds: task.labelIds ?? [],
			dueDateDaysOffset: task.dueDateDaysOffset ?? undefined,
			checklistItems: task.checklistItems ?? [],
		});
		setDialogOpen(true);
	};

	if (isLoading) {
		return (
			<>
				<PageTitle title={t("recurring:pageTitle")} />
				<ProjectLayout
					projectId={projectId}
					workspaceId={workspaceId}
					activeView="recurring"
				>
					<div className="space-y-4 p-4">
						<Skeleton className="h-8 w-48" />
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</ProjectLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title={t("recurring:pageTitle")} />
			<ProjectLayout
				projectId={projectId}
				workspaceId={workspaceId}
				activeView="recurring"
			>
				<div className="space-y-5 p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">{t("recurring:title")}</h2>
						<Button
							size="xs"
							className="gap-1"
							onClick={() => {
								setEditingTask(null);
								setDialogOpen(true);
							}}
						>
							<Plus className="size-3.5" />
							{t("recurring:create.trigger")}
						</Button>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{t("recurring:tableTitle")}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							{!tasks || tasks.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<RefreshCw />
										</EmptyMedia>
										<EmptyTitle>{t("recurring:empty.title")}</EmptyTitle>
										<EmptyDescription>
											{t("recurring:empty.description")}
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="text-foreground font-medium">
												{t("recurring:table.title")}
											</TableHead>
											<TableHead className="text-foreground font-medium">
												{t("recurring:table.schedule")}
											</TableHead>
											<TableHead className="text-foreground font-medium">
												{t("recurring:table.nextRun")}
											</TableHead>
											<TableHead className="text-foreground font-medium">
												{t("recurring:table.lastRun")}
											</TableHead>
											<TableHead className="text-foreground font-medium">
												{t("recurring:table.priority")}
											</TableHead>
											<TableHead className="w-20 text-center text-foreground font-medium">
												{t("recurring:table.active")}
											</TableHead>
											<TableHead className="w-24" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{tasks.map((task) => (
											<TableRow key={task.id}>
												<TableCell className="font-medium whitespace-nowrap">
													{task.title}
												</TableCell>
												<TableCell className="text-muted-foreground whitespace-nowrap">
													{scheduleLabel(task.frequency, task.intervalValue)}
												</TableCell>
												<TableCell className="text-muted-foreground whitespace-nowrap">
													{formatDateMedium(new Date(task.nextRunAt))}
												</TableCell>
												<TableCell className="text-muted-foreground whitespace-nowrap">
													{task.lastRunAt
														? formatDateMedium(new Date(task.lastRunAt))
														: "—"}
												</TableCell>
												<TableCell>
													{task.priority && task.priority !== "no-priority" ? (
														<Badge
															variant="outline"
															className="gap-1 capitalize"
														>
															{getPriorityIcon(task.priority)}
															{t(`tasks:priority.${task.priority}`, {
																defaultValue: task.priority,
															})}
														</Badge>
													) : (
														<span className="text-muted-foreground">—</span>
													)}
												</TableCell>
												<TableCell className="text-center">
													<Switch
														checked={task.isActive}
														onCheckedChange={() =>
															handleToggleActive(task.id, task.isActive)
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Button
															variant="ghost"
															size="icon-xs"
															className="text-muted-foreground hover:text-foreground"
															onClick={() => openEditDialog(task)}
														>
															<Pencil className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon-xs"
															className="text-muted-foreground hover:text-destructive"
															onClick={() => setDeletingTaskId(task.id)}
														>
															<Trash2 className="size-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</ProjectLayout>

			<RecurringTaskDialog
				open={dialogOpen}
				onOpenChange={(newOpen) => {
					setDialogOpen(newOpen);
					if (!newOpen) setEditingTask(null);
				}}
				onSubmit={editingTask ? handleUpdate : handleCreate}
				isPending={
					editingTask ? updateMutation.isPending : createMutation.isPending
				}
				columns={columns}
				users={workspaceUsers?.members ?? []}
				workspaceId={workspaceId}
				initialData={editingTask ?? undefined}
			/>

			<AlertDialog
				open={!!deletingTaskId}
				onOpenChange={(newOpen) => {
					if (!newOpen) setDeletingTaskId(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("recurring:deleteConfirm.title")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("recurring:deleteConfirm.description")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose>
							{t("recurring:deleteConfirm.cancel")}
						</AlertDialogClose>
						<AlertDialogClose onClick={handleDelete}>
							{t("recurring:deleteConfirm.confirm")}
						</AlertDialogClose>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
