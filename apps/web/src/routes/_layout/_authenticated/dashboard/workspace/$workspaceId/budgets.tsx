import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import useGetWorkspaceBudgets from "@/hooks/queries/budget/use-get-workspace-budgets";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/budgets",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();
	const { data: budgets, isLoading } = useGetWorkspaceBudgets(workspaceId);

	const totalBudget =
		budgets?.reduce((sum, b) => sum + Number.parseFloat(b.totalBudget), 0) ?? 0;
	const totalSpent =
		budgets?.reduce((sum, b) => sum + Number.parseFloat(b.totalSpent), 0) ?? 0;

	if (isLoading) {
		return (
			<>
				<PageTitle title="Budgets" />
				<WorkspaceLayout title="Budgets">
					<div className="space-y-4 p-4">
						<div className="grid gap-4 sm:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader className="pb-2">
										<Skeleton className="h-4 w-20" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-8 w-24" />
									</CardContent>
								</Card>
							))}
						</div>
						<Skeleton className="h-64 w-full" />
					</div>
				</WorkspaceLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Budgets" />
			<WorkspaceLayout title="Budgets">
				<div className="space-y-6 p-4">
					<div className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Budgeted
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">
									$
									{totalBudget.toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Spent
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
									$
									{totalSpent.toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Remaining
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className={`text-2xl font-bold ${
										totalBudget - totalSpent < 0
											? "text-red-600 dark:text-red-400"
											: "text-green-600 dark:text-green-400"
									}`}
								>
									$
									{(totalBudget - totalSpent).toLocaleString("en-US", {
										minimumFractionDigits: 2,
									})}
								</p>
							</CardContent>
						</Card>
					</div>

					{!budgets || budgets.length === 0 ? (
						<Empty className="min-h-[40vh]">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<DollarSign />
								</EmptyMedia>
								<EmptyTitle>No budgets yet</EmptyTitle>
								<EmptyDescription>
									Create a budget for a project to see it here.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Projects</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Budget</TableHead>
											<TableHead>Spent</TableHead>
											<TableHead>Remaining</TableHead>
											<TableHead>Usage</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{budgets.map((b) => {
											const budgetNum = Number.parseFloat(b.totalBudget);
											const spentNum = Number.parseFloat(b.totalSpent);
											const remainingNum = Number.parseFloat(b.remaining);
											const usagePercent =
												budgetNum > 0
													? Math.min((spentNum / budgetNum) * 100, 100)
													: 0;

											return (
												<TableRow
													key={b.projectId}
													className="cursor-pointer"
													onClick={() =>
														navigate({
															to: "/dashboard/workspace/$workspaceId/project/$projectId/budget",
															params: { workspaceId, projectId: b.projectId },
														})
													}
												>
													<TableCell className="font-medium">
														{b.projectName}
													</TableCell>
													<TableCell>
														$
														{budgetNum.toLocaleString("en-US", {
															minimumFractionDigits: 2,
														})}
													</TableCell>
													<TableCell className="text-amber-600 dark:text-amber-400">
														$
														{spentNum.toLocaleString("en-US", {
															minimumFractionDigits: 2,
														})}
													</TableCell>
													<TableCell
														className={
															remainingNum < 0
																? "text-red-600 dark:text-red-400"
																: "text-green-600 dark:text-green-400"
														}
													>
														$
														{remainingNum.toLocaleString("en-US", {
															minimumFractionDigits: 2,
														})}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
																<div
																	className="h-full rounded-full bg-primary transition-all"
																	style={{ width: `${usagePercent}%` }}
																/>
															</div>
															<span className="text-xs text-muted-foreground">
																{usagePercent.toFixed(0)}%
															</span>
														</div>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}
				</div>
			</WorkspaceLayout>
		</>
	);
}
