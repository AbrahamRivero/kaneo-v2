import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

type AddExpenseDialogProps = {
	onCreate: (data: {
		description: string;
		amount: string;
		category?: string;
	}) => Promise<unknown>;
	isPending: boolean;
};

function AddExpenseDialog({ onCreate, isPending }: AddExpenseDialogProps) {
	const [open, setOpen] = useState(false);
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");

	const handleSubmit = async () => {
		if (!description || !amount) return;
		await onCreate({
			description,
			amount,
			category: category || undefined,
		});
		setDescription("");
		setAmount("");
		setCategory("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="space-y-6"
				>
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="expense-description">Description</Label>
							<Input
								id="expense-description"
								placeholder="What was this expense for?"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="expense-amount">Amount</Label>
							<Input
								id="expense-amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="expense-category">Category</Label>
							<Input
								id="expense-category"
								placeholder="e.g. Materials, Labor, Software"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button type="submit" loading={isPending}>
							Add Expense
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default AddExpenseDialog;
