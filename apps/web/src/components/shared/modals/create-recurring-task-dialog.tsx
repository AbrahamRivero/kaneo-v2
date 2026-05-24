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

type CreateRecurringTaskDialogProps = {
	onCreate: (data: {
		title: string;
		description?: string;
		frequency: string;
		intervalValue: number;
		priority?: string;
		nextRunAt: string;
	}) => Promise<unknown>;
	isPending: boolean;
};

function CreateRecurringTaskDialog({
	onCreate,
	isPending,
}: CreateRecurringTaskDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [frequency, setFrequency] = useState("daily");
	const [intervalValue, setIntervalValue] = useState(1);
	const [priority, setPriority] = useState("no-priority");

	const handleSubmit = async () => {
		if (!title) return;

		const nextRunAt = new Date();
		nextRunAt.setMinutes(nextRunAt.getMinutes() + 1);

		await onCreate({
			title,
			description: description || undefined,
			frequency,
			intervalValue,
			priority: priority !== "no-priority" ? priority : undefined,
			nextRunAt: nextRunAt.toISOString(),
		});

		setTitle("");
		setDescription("");
		setFrequency("daily");
		setIntervalValue(1);
		setPriority("no-priority");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="xs" className="gap-1">
					<Plus className="size-3.5" />
					Add Recurring Task
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Recurring Task</DialogTitle>
					<DialogDescription>
						Set up a task that will be automatically created on a schedule.
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
							<Label htmlFor="rt-title">Title</Label>
							<Input
								id="rt-title"
								placeholder="Task title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rt-description">Description</Label>
							<Input
								id="rt-description"
								placeholder="Optional description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="rt-frequency">Frequency</Label>
								<Select
									value={frequency}
									onValueChange={(v) => setFrequency(v ?? "")}
								>
									<SelectTrigger id="rt-frequency">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="daily">Daily</SelectItem>
										<SelectItem value="weekly">Weekly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="rt-interval">Every</Label>
								<Input
									id="rt-interval"
									type="number"
									min={1}
									value={intervalValue}
									onChange={(e) => setIntervalValue(Number(e.target.value))}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rt-priority">Priority</Label>
							<Select
								value={priority}
								onValueChange={(v) => setPriority(v ?? "")}
							>
								<SelectTrigger id="rt-priority">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="no-priority">None</SelectItem>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">Cancel</Button>
						</DialogClose>
						<Button type="submit" loading={isPending}>
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateRecurringTaskDialog;
