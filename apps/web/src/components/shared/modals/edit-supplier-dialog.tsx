import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditSupplierDialogProps = {
	supplier: {
		name: string;
		contactName: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		website: string | null;
		notes: string | null;
	};
	onSave: (data: {
		name: string;
		contactName: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		website: string | null;
		notes: string | null;
	}) => void;
};

function EditSupplierDialog({ supplier, onSave }: EditSupplierDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(supplier.name);
	const [contactName, setContactName] = useState(supplier.contactName ?? "");
	const [email, setEmail] = useState(supplier.contactEmail ?? "");
	const [phone, setPhone] = useState(supplier.contactPhone ?? "");
	const [website, setWebsite] = useState(supplier.website ?? "");
	const [notes, setNotes] = useState(supplier.notes ?? "");

	const openDialog = () => {
		setName(supplier.name);
		setContactName(supplier.contactName ?? "");
		setEmail(supplier.contactEmail ?? "");
		setPhone(supplier.contactPhone ?? "");
		setWebsite(supplier.website ?? "");
		setNotes(supplier.notes ?? "");
		setOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave({
			name,
			contactName: contactName || null,
			contactEmail: email || null,
			contactPhone: phone || null,
			website: website || null,
			notes: notes || null,
		});
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" onClick={openDialog}>
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Vendor</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="px-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="ename">Name *</Label>
							<Input
								id="ename"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="econtact">Contact Name</Label>
							<Input
								id="econtact"
								value={contactName}
								onChange={(e) => setContactName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="eemail">Email</Label>
							<Input
								id="eemail"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ephone">Phone</Label>
							<Input
								id="ephone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ewebsite">Website</Label>
							<Input
								id="ewebsite"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="enotes">Notes</Label>
							<Textarea
								id="enotes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default EditSupplierDialog;
