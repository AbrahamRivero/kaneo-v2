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

type AddContractDialogProps = {
	onCreate: (data: {
		title: string;
		value?: string;
		status: string;
	}) => Promise<unknown>;
};

function AddContractDialog({ onCreate }: AddContractDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [value, setValue] = useState("");
	const [status, setStatus] = useState("draft");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		onCreate({
			title: title.trim(),
			...(value && { value }),
			status,
		});
		setTitle("");
		setValue("");
		setStatus("draft");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="mr-1 size-4" />
					Add Contract
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Contract</DialogTitle>
					<DialogDescription>
						Create a new contract for this vendor.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="ctitle">Title *</Label>
							<Input
								id="ctitle"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="cvalue">Value</Label>
							<Input
								id="cvalue"
								type="number"
								step="0.01"
								value={value}
								onChange={(e) => setValue(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="cstatus">Status</Label>
							<Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
								<SelectTrigger id="cstatus">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="terminated">Terminated</SelectItem>
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

export default AddContractDialog;
