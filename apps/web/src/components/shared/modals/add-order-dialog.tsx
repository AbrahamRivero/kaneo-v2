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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type AddOrderDialogProps = {
	onCreate: (data: {
		title: string;
		amount?: string;
		status: string;
	}) => Promise<unknown>;
};

function AddOrderDialog({ onCreate }: AddOrderDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [status, setStatus] = useState("draft");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onCreate({
			title: title.trim(),
			...(amount && { amount }),
			status,
		});
		setTitle("");
		setAmount("");
		setStatus("draft");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="mr-1 size-4" />
					Add Order
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Service Order</DialogTitle>
					<DialogDescription>
						Create a new service order for this vendor.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="otitle">Title *</Label>
							<Input
								id="otitle"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="oamount">Amount</Label>
							<Input
								id="oamount"
								type="number"
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ostatus">Status</Label>
							<Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
								<SelectTrigger id="ostatus">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="ordered">Ordered</SelectItem>
									<SelectItem value="in-progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default AddOrderDialog;
