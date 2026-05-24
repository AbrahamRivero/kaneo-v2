import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Trash2 } from "lucide-react";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import CreateRecurringTaskDialog from "@/components/shared/modals/create-recurring-task-dialog";
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
import { useCreateRecurringTask } from "@/hooks/mutations/recurring-tasks/use-create-recurring-task";
import { useDeleteRecurringTask } from "@/hooks/mutations/recurring-tasks/use-delete-recurring-task";
import { useUpdateRecurringTask } from "@/hooks/mutations/recurring-tasks/use-update-recurring-task";
import useListRecurringTasks from "@/hooks/queries/recurring-tasks/use-list-recurring-tasks";
import { formatDateMedium } from "@/lib/format";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/recurring-tasks",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { projectId, workspaceId } = Route.useParams();
	const { data: tasks, isLoading } = useListRecurringTasks(projectId);
	const createMutation = useCreateRecurringTask();
	const updateMutation = useUpdateRecurringTask();
	const deleteMutation = useDeleteRecurringTask();

	const handleCreate = async (data: {
		title: string;
		description?: string;
		frequency: string;
		intervalValue: number;
		priority?: string;
		nextRunAt: string;
	}) => {
		await createMutation.mutateAsync({
			projectId,
			...data,
		});
	};

	const handleToggleActive = async (
		recurringTaskId: string,
		isActive: boolean,
	) => {
		await updateMutation.mutateAsync({
			projectId,
			recurringTaskId,
			isActive: !isActive,
		});
	};

	const handleDelete = async (recurringTaskId: string) => {
		await deleteMutation.mutateAsync({ recurringTaskId, projectId });
	};

	const frequencyLabel = (freq: string) => {
		switch (freq) {
			case "daily":
				return "Daily";
			case "weekly":
				return "Weekly";
			case "monthly":
				return "Monthly";
			default:
				return freq;
		}
	};

	if (isLoading) {
		return (
			<>
				<PageTitle title="Recurring Tasks" />
				<ProjectLayout
					projectId={projectId}
					workspaceId={workspaceId}
					activeView="recurring"
				>
					<div className="space-y-4 p-4">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-64 w-full" />
					</div>
				</ProjectLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Recurring Tasks" />
			<ProjectLayout
				projectId={projectId}
				workspaceId={workspaceId}
				activeView="recurring"
			>
				<div className="space-y-5 p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Recurring Tasks</h2>
						<CreateRecurringTaskDialog
							onCreate={handleCreate}
							isPending={createMutation.isPending}
						/>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Scheduled Tasks</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							{!tasks || tasks.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<RefreshCw />
										</EmptyMedia>
										<EmptyTitle>No recurring tasks</EmptyTitle>
										<EmptyDescription>
											No recurring tasks configured for this project.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="text-foreground font-medium">
												Title
											</TableHead>
											<TableHead className="text-foreground font-medium">
												Schedule
											</TableHead>
											<TableHead className="text-foreground font-medium">
												Next Run
											</TableHead>
											<TableHead className="text-foreground font-medium">
												Priority
											</TableHead>
											<TableHead className="w-20 text-center text-foreground font-medium">
												Active
											</TableHead>
											<TableHead className="w-16" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{tasks.map((task) => (
											<TableRow key={task.id}>
												<TableCell className="font-medium whitespace-nowrap">
													{task.title}
												</TableCell>
												<TableCell className="text-muted-foreground whitespace-nowrap">
													{frequencyLabel(task.frequency)}
													{task.intervalValue > 1 &&
														` (×${task.intervalValue})`}
												</TableCell>
												<TableCell className="text-muted-foreground whitespace-nowrap">
													{formatDateMedium(new Date(task.nextRunAt))}
												</TableCell>
												<TableCell>
													{task.priority && task.priority !== "no-priority" ? (
														<Badge variant="outline" className="capitalize">
															{task.priority}
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
													<Button
														variant="ghost"
														size="icon-xs"
														className="text-muted-foreground hover:text-destructive"
														onClick={() => handleDelete(task.id)}
														loading={deleteMutation.isPending}
													>
														<Trash2 className="size-4" />
													</Button>
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
		</>
	);
}
