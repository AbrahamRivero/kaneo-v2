import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, DollarSign, Trash2, Wallet } from "lucide-react";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import AddExpenseDialog from "@/components/shared/modals/add-expense-dialog";
import SetBudgetDialog from "@/components/shared/modals/set-budget-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCreateExpense } from "@/hooks/mutations/budget/use-create-expense";
import { useDeleteExpense } from "@/hooks/mutations/budget/use-delete-expense";
import { useSetBudget } from "@/hooks/mutations/budget/use-set-budget";
import useGetBudget from "@/hooks/queries/budget/use-get-budget";
import { formatDateMedium } from "@/lib/format";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/budget",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { projectId, workspaceId } = Route.useParams();
	const { data: budget, isLoading } = useGetBudget(projectId);
	const setBudgetMutation = useSetBudget();
	const createExpenseMutation = useCreateExpense();
	const deleteExpenseMutation = useDeleteExpense();

	const handleSetBudget = async (amount: string) => {
		await setBudgetMutation.mutateAsync({
			projectId,
			totalBudget: amount,
		});
	};

	const handleAddExpense = async (data: {
		description: string;
		amount: string;
		category?: string;
	}) => {
		if (!budget) return;
		await createExpenseMutation.mutateAsync({
			budgetId: budget.id,
			...data,
		});
	};

	const handleDeleteExpense = async (expenseId: string) => {
		await deleteExpenseMutation.mutateAsync({ expenseId });
	};

	if (isLoading) {
		return (
			<>
				<PageTitle title="Budget" />
				<ProjectLayout
					projectId={projectId}
					workspaceId={workspaceId}
					activeView="budget"
				>
					<div className="space-y-4 p-4">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
				</ProjectLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Budget" />
			<ProjectLayout
				projectId={projectId}
				workspaceId={workspaceId}
				activeView="budget"
			>
				<div className="space-y-5 p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Budget & Expenses</h2>
						<div className="flex gap-2">
							<SetBudgetDialog
								onSave={handleSetBudget}
								isPending={setBudgetMutation.isPending}
							/>
							<AddExpenseDialog
								onCreate={handleAddExpense}
								isPending={createExpenseMutation.isPending}
							/>
						</div>
					</div>

					{budget && (
						<>
							<div className="grid gap-4 sm:grid-cols-3">
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm text-muted-foreground">
											Total Budget
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-3">
										<div className="flex items-center gap-3">
											<DollarSign className="size-5 text-muted-foreground shrink-0" />
											<p className="text-3xl font-semibold">
												$
												{Number.parseFloat(budget.totalBudget).toLocaleString(
													"en-US",
													{ minimumFractionDigits: 2 },
												)}
											</p>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm text-muted-foreground">
											Total Spent
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-3">
										<div className="flex items-center gap-3">
											<ArrowUp className="size-5 text-muted-foreground shrink-0" />
											<p className="text-3xl font-semibold text-amber-600 dark:text-amber-400">
												$
												{Number.parseFloat(budget.totalSpent).toLocaleString(
													"en-US",
													{ minimumFractionDigits: 2 },
												)}
											</p>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm text-muted-foreground">
											Remaining
										</CardTitle>
									</CardHeader>
									<CardContent className="pt-3">
										<div className="flex items-center gap-3">
											<Wallet className="size-5 text-muted-foreground shrink-0" />
											<p
												className={`text-3xl font-semibold ${
													Number.parseFloat(budget.remaining) < 0
														? "text-red-600 dark:text-red-400"
														: "text-green-600 dark:text-green-400"
												}`}
											>
												$
												{Number.parseFloat(budget.remaining).toLocaleString(
													"en-US",
													{ minimumFractionDigits: 2 },
												)}
											</p>
										</div>
									</CardContent>
								</Card>
							</div>

							<Progress
								value={Math.min(
									(Number.parseFloat(budget.totalSpent) /
										Number.parseFloat(budget.totalBudget || "1")) *
										100,
									100,
								)}
								className="h-3"
							/>

							<Card>
								<CardHeader>
									<CardTitle className="text-sm font-medium">
										Expenses
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									{budget.expenses.length === 0 ? (
										<Empty className="min-h-[30vh]">
											<EmptyHeader>
												<EmptyMedia variant="icon">
													<DollarSign />
												</EmptyMedia>
												<EmptyTitle>No expenses yet</EmptyTitle>
												<EmptyDescription>
													No expenses recorded for this budget.
												</EmptyDescription>
											</EmptyHeader>
										</Empty>
									) : (
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="text-foreground font-medium">
														Description
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Category
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Amount
													</TableHead>
													<TableHead className="text-foreground font-medium">
														Date
													</TableHead>
													<TableHead className="w-16" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{budget.expenses.map((expense) => (
													<TableRow key={expense.id}>
														<TableCell className="font-medium">
															{expense.description}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{expense.category ?? "—"}
														</TableCell>
														<TableCell>
															$
															{Number.parseFloat(expense.amount).toLocaleString(
																"en-US",
																{ minimumFractionDigits: 2 },
															)}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{expense.incurredAt
																? formatDateMedium(new Date(expense.incurredAt))
																: "—"}
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="icon-xs"
																className="text-muted-foreground hover:text-destructive"
																onClick={() => handleDeleteExpense(expense.id)}
																loading={deleteExpenseMutation.isPending}
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
						</>
					)}
				</div>
			</ProjectLayout>
		</>
	);
}
