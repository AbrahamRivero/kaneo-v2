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
import { Textarea } from "@/components/ui/textarea";

type AddSupplierDialogProps = {
	onCreate: (data: {
		name: string;
		contactName?: string;
		contactEmail?: string;
		contactPhone?: string;
		website?: string;
		notes?: string;
	}) => Promise<unknown>;
};

function AddSupplierDialog({ onCreate }: AddSupplierDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [contactName, setContactName] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [contactPhone, setContactPhone] = useState("");
	const [website, setWebsite] = useState("");
	const [notes, setNotes] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		onCreate({
			name: name.trim(),
			...(contactName && { contactName }),
			...(contactEmail && { contactEmail }),
			...(contactPhone && { contactPhone }),
			...(website && { website }),
			...(notes && { notes }),
		});
		setName("");
		setContactName("");
		setContactEmail("");
		setContactPhone("");
		setWebsite("");
		setNotes("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="mr-1 size-4" />
					Add Vendor
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Vendor</DialogTitle>
					<DialogDescription>
						Add a new vendor to your workspace.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="supplier-name">Name *</Label>
							<Input
								id="supplier-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="supplier-contact">Contact Name</Label>
							<Input
								id="supplier-contact"
								value={contactName}
								onChange={(e) => setContactName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="supplier-email">Email</Label>
							<Input
								id="supplier-email"
								type="email"
								value={contactEmail}
								onChange={(e) => setContactEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="supplier-phone">Phone</Label>
							<Input
								id="supplier-phone"
								value={contactPhone}
								onChange={(e) => setContactPhone(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="supplier-website">Website</Label>
							<Input
								id="supplier-website"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="supplier-notes">Notes</Label>
							<Textarea
								id="supplier-notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
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

export default AddSupplierDialog;
