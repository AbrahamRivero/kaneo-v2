import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
	const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
	const [newBudgetAmount, setNewBudgetAmount] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newAmount, setNewAmount] = useState("");
	const [newCategory, setNewCategory] = useState("");

	const handleSetBudget = async () => {
		if (!newBudgetAmount) return;
		await setBudgetMutation.mutateAsync({
			projectId,
			totalBudget: newBudgetAmount,
		});
		setNewBudgetAmount("");
		setIsSetBudgetOpen(false);
	};

	const handleAddExpense = async () => {
		if (!newDescription || !newAmount || !budget) return;
		await createExpenseMutation.mutateAsync({
			budgetId: budget.id,
			description: newDescription,
			amount: newAmount,
			category: newCategory || undefined,
		});
		setNewDescription("");
		setNewAmount("");
		setNewCategory("");
		setIsAddExpenseOpen(false);
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
				<div className="space-y-6 p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Budget & Expenses</h2>
						<div className="flex gap-2">
							<Dialog open={isSetBudgetOpen} onOpenChange={setIsSetBudgetOpen}>
								<DialogTrigger asChild>
									<Button variant="outline" size="xs">
										Set Budget
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Set Total Budget</DialogTitle>
										<DialogDescription>
											Set the total budget amount for this project.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-2">
										<Label htmlFor="budget-amount">Budget Amount</Label>
										<Input
											id="budget-amount"
											type="number"
											step="0.01"
											placeholder="0.00"
											value={newBudgetAmount}
											onChange={(e) => setNewBudgetAmount(e.target.value)}
										/>
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="ghost">Cancel</Button>
										</DialogClose>
										<Button
											onClick={handleSetBudget}
											loading={setBudgetMutation.isPending}
										>
											Save
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<Dialog
								open={isAddExpenseOpen}
								onOpenChange={setIsAddExpenseOpen}
							>
								<DialogTrigger asChild>
									<Button size="xs" className="gap-1">
										<Plus className="size-3.5" />
										Add Expense
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Add Expense</DialogTitle>
										<DialogDescription>
											Add a new expense to this project budget.
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="expense-description">Description</Label>
											<Input
												id="expense-description"
												placeholder="What was this expense for?"
												value={newDescription}
												onChange={(e) => setNewDescription(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="expense-amount">Amount</Label>
											<Input
												id="expense-amount"
												type="number"
												step="0.01"
												placeholder="0.00"
												value={newAmount}
												onChange={(e) => setNewAmount(e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="expense-category">Category</Label>
											<Input
												id="expense-category"
												placeholder="e.g. Materials, Labor, Software"
												value={newCategory}
												onChange={(e) => setNewCategory(e.target.value)}
											/>
										</div>
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="ghost">Cancel</Button>
										</DialogClose>
										<Button
											onClick={handleAddExpense}
											loading={createExpenseMutation.isPending}
										>
											Add Expense
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
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
									<CardContent>
										<p className="text-2xl font-bold">
											$
											{Number.parseFloat(budget.totalBudget).toLocaleString(
												"en-US",
												{ minimumFractionDigits: 2 },
											)}
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
											{Number.parseFloat(budget.totalSpent).toLocaleString(
												"en-US",
												{ minimumFractionDigits: 2 },
											)}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardTitle className="text-sm text-muted-foreground">
											Remaining
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p
											className={`text-2xl font-bold ${
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
									</CardContent>
								</Card>
							</div>

							<div className="w-full rounded-lg bg-muted/30 p-1">
								<div
									className="h-2 rounded-full bg-primary transition-all duration-300"
									style={{
										width: `${Math.min(
											(Number.parseFloat(budget.totalSpent) /
												Number.parseFloat(budget.totalBudget || "1")) *
												100,
											100,
										)}%`,
									}}
								/>
							</div>

							<Card>
								<CardHeader>
									<CardTitle className="text-base">Expenses</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									{budget.expenses.length === 0 ? (
										<div className="flex flex-col items-center gap-2 py-12 text-center">
											<p className="text-sm text-muted-foreground">
												No expenses recorded yet.
											</p>
											<Button
												variant="outline"
												size="xs"
												className="gap-1"
												onClick={() => setIsAddExpenseOpen(true)}
											>
												<Plus className="size-3.5" />
												Add your first expense
											</Button>
										</div>
									) : (
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Description</TableHead>
													<TableHead>Category</TableHead>
													<TableHead>Amount</TableHead>
													<TableHead>Date</TableHead>
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
