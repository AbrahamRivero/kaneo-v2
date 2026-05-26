import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
		columnId?: string;
		assigneeId?: string;
		nextRunAt: string;
	}) => Promise<unknown>;
	isPending: boolean;
	columns: { id: string; name: string }[];
	users: { userId: string; user: { id: string; name: string | null } }[];
};

function CreateRecurringTaskDialog({
	onCreate,
	isPending,
	columns,
	users,
}: CreateRecurringTaskDialogProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [frequency, setFrequency] = useState("daily");
	const [intervalValue, setIntervalValue] = useState(1);
	const [priority, setPriority] = useState("no-priority");
	const [columnId, setColumnId] = useState("");
	const [assigneeId, setAssigneeId] = useState("");

	const handleSubmit = async () => {
		if (!title) return;

		const nextRunAt = new Date();
		nextRunAt.setMinutes(nextRunAt.getMinutes() + 1);

		await onCreate({
			title,
			description: description || undefined,
			frequency,
			intervalValue,
			columnId: columnId || undefined,
			assigneeId: assigneeId || undefined,
			priority: priority !== "no-priority" ? priority : undefined,
			nextRunAt: nextRunAt.toISOString(),
		});

		setTitle("");
		setDescription("");
		setFrequency("daily");
		setIntervalValue(1);
		setPriority("no-priority");
		setColumnId("");
		setAssigneeId("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="xs" className="gap-1">
					<Plus className="size-3.5" />
					{t("recurring:create.trigger")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("recurring:create.title")}</DialogTitle>
					<DialogDescription>
						{t("recurring:create.description")}
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
							<Label htmlFor="rt-title">
								{t("recurring:create.titleField")}
							</Label>
							<Input
								id="rt-title"
								placeholder={t("recurring:create.titlePlaceholder")}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rt-description">
								{t("recurring:create.descriptionField")}
							</Label>
							<Input
								id="rt-description"
								placeholder={t("recurring:create.descriptionPlaceholder")}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="rt-frequency">
									{t("recurring:create.frequency")}
								</Label>
								<Select
									value={frequency}
									onValueChange={(v) => setFrequency(v ?? "")}
								>
									<SelectTrigger id="rt-frequency">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="daily">
											{t("recurring:frequency.daily")}
										</SelectItem>
										<SelectItem value="weekly">
											{t("recurring:frequency.weekly")}
										</SelectItem>
										<SelectItem value="monthly">
											{t("recurring:frequency.monthly")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="rt-interval">
									{t("recurring:create.every")}
								</Label>
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
							<Label htmlFor="rt-column">{t("recurring:create.column")}</Label>
							<Select
								value={columnId}
								onValueChange={(v) => setColumnId(v ?? "")}
							>
								<SelectTrigger id="rt-column">
									<SelectValue
										placeholder={t("recurring:create.columnDefault")}
									/>
								</SelectTrigger>
								<SelectContent>
									{columns.map((col) => (
										<SelectItem key={col.id} value={col.id}>
											{col.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rt-assignee">
								{t("recurring:create.assignee")}
							</Label>
							<Select
								value={assigneeId}
								onValueChange={(v) => setAssigneeId(v ?? "")}
							>
								<SelectTrigger id="rt-assignee">
									<SelectValue
										placeholder={t("recurring:create.assigneeUnassigned")}
									/>
								</SelectTrigger>
								<SelectContent>
									{users.map((member) => (
										<SelectItem key={member.userId} value={member.userId}>
											{member.user.name ?? t("common:people.unknown")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rt-priority">
								{t("recurring:create.priority")}
							</Label>
							<Select
								value={priority}
								onValueChange={(v) => setPriority(v ?? "")}
							>
								<SelectTrigger id="rt-priority">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="no-priority">
										{t("recurring:create.priorityNone")}
									</SelectItem>
									<SelectItem value="low">{t("tasks:priority.low")}</SelectItem>
									<SelectItem value="medium">
										{t("tasks:priority.medium")}
									</SelectItem>
									<SelectItem value="high">
										{t("tasks:priority.high")}
									</SelectItem>
									<SelectItem value="urgent">
										{t("tasks:priority.urgent")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">{t("common:actions.cancel")}</Button>
						</DialogClose>
						<Button type="submit" loading={isPending}>
							{t("recurring:create.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateRecurringTaskDialog;
