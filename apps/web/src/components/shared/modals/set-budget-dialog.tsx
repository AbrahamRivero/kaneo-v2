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

type SetBudgetDialogProps = {
	onSave: (amount: string) => Promise<unknown>;
	isPending: boolean;
};

function SetBudgetDialog({ onSave, isPending }: SetBudgetDialogProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");

	const handleSave = async () => {
		if (!amount) return;
		await onSave(amount);
		setAmount("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					className="space-y-6"
				>
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="budget-amount">Budget Amount</Label>
							<Input
								id="budget-amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button type="submit" loading={isPending}>
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default SetBudgetDialog;
