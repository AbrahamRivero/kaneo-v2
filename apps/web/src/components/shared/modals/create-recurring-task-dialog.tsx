import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";

const labelColorMap: Record<string, string> = {
	gray: "var(--color-stone-500)",
	"dark-gray": "var(--color-slate-500)",
	purple: "var(--color-violet-500)",
	teal: "var(--color-emerald-600)",
	green: "var(--color-green-600)",
	yellow: "var(--color-amber-600)",
	orange: "var(--color-orange-600)",
	pink: "var(--color-rose-600)",
	red: "var(--color-red-600)",
};

function getLabelColor(color: string): string {
	return labelColorMap[color] || "var(--color-neutral-400)";
}

function toDatetimeLocal(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const h = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	return `${y}-${m}-${d}T${h}:${min}`;
}

function fromDatetimeLocal(value: string): Date {
	return new Date(value);
}

export type RecurringTaskFormData = {
	title: string;
	description?: string;
	frequency: string;
	intervalValue: number;
	priority?: string;
	columnId?: string;
	assigneeId?: string;
	nextRunAt: string;
	labelIds?: string[];
	dueDateDaysOffset?: number;
	checklistItems?: { text: string; position: number }[];
};

export type ChecklistEntry = {
	tempId: string;
	text: string;
};

type RecurringTaskDialogProps = {
	onSubmit: (data: RecurringTaskFormData) => Promise<unknown>;
	isPending: boolean;
	columns: { id: string; name: string }[];
	users: { userId: string; user: { id: string; name: string | null } }[];
	workspaceId: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	initialData?: RecurringTaskFormData & { id?: string };
};

function RecurringTaskDialog({
	onSubmit,
	isPending,
	columns,
	users,
	workspaceId,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	initialData,
}: RecurringTaskDialogProps) {
	const { t } = useTranslation();
	const [internalOpen, setInternalOpen] = useState(false);

	const open = controlledOpen ?? internalOpen;
	const setOpen = controlledOnOpenChange ?? setInternalOpen;
	const isEditMode = !!initialData;

	const { data: workspaceLabels = [] } = useGetLabelsByWorkspace(workspaceId);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [frequency, setFrequency] = useState("daily");
	const [intervalValue, setIntervalValue] = useState(1);
	const [priority, setPriority] = useState("no-priority");
	const [columnId, setColumnId] = useState("");
	const [assigneeId, setAssigneeId] = useState("");
	const [labelIds, setLabelIds] = useState<string[]>([]);
	const [dueDateDaysOffset, setDueDateDaysOffset] = useState<
		number | undefined
	>();
	const [nextRunAtLocal, setNextRunAtLocal] = useState("");
	const [checklistItems, setChecklistItems] = useState<ChecklistEntry[]>([]);
	const [checklistInput, setChecklistInput] = useState("");
	let checklistCounter = 0;

	const addChecklistItem = () => {
		const text = checklistInput.trim();
		if (!text) return;
		setChecklistItems((prev) => [
			...prev,
			{ tempId: `_new_${++checklistCounter}`, text },
		]);
		setChecklistInput("");
	};

	const removeChecklistItem = (tempId: string) => {
		setChecklistItems((prev) => prev.filter((item) => item.tempId !== tempId));
	};

	useEffect(() => {
		if (open) {
			if (initialData) {
				setTitle(initialData.title);
				setDescription(initialData.description ?? "");
				setFrequency(initialData.frequency);
				setIntervalValue(initialData.intervalValue);
				setPriority(initialData.priority ?? "no-priority");
				setColumnId(initialData.columnId ?? "");
				setAssigneeId(initialData.assigneeId ?? "");
				setLabelIds(initialData.labelIds ?? []);
				setDueDateDaysOffset(initialData.dueDateDaysOffset);
				setNextRunAtLocal(toDatetimeLocal(new Date(initialData.nextRunAt)));
				setChecklistItems(
					(initialData.checklistItems ?? []).map((item, i) => ({
						tempId: `existing_${i}`,
						text: item.text,
					})),
				);
			} else {
				setTitle("");
				setDescription("");
				setFrequency("daily");
				setIntervalValue(1);
				setPriority("no-priority");
				setColumnId("");
				setAssigneeId("");
				setLabelIds([]);
				setDueDateDaysOffset(undefined);
				setChecklistItems([]);
				const defaultDate = new Date();
				defaultDate.setMinutes(defaultDate.getMinutes() + 1);
				setNextRunAtLocal(toDatetimeLocal(defaultDate));
			}
		}
	}, [open, initialData]);

	const handleSubmit = async () => {
		if (!title) return;

		await onSubmit({
			title,
			description: description || undefined,
			frequency,
			intervalValue,
			columnId: columnId || undefined,
			assigneeId: assigneeId || undefined,
			priority: priority !== "no-priority" ? priority : undefined,
			nextRunAt: fromDatetimeLocal(nextRunAtLocal).toISOString(),
			labelIds: labelIds.length > 0 ? labelIds : undefined,
			dueDateDaysOffset,
			checklistItems:
				checklistItems.length > 0
					? checklistItems.map((item, i) => ({
							text: item.text,
							position: i,
						}))
					: undefined,
		});

		setOpen(false);
	};

	const toggleLabel = (labelId: string) => {
		setLabelIds((prev) =>
			prev.includes(labelId)
				? prev.filter((id) => id !== labelId)
				: [...prev, labelId],
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditMode
							? t("recurring:edit.title")
							: t("recurring:create.title")}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? t("recurring:edit.description")
							: t("recurring:create.description")}
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
						<div className="space-y-2">
							<Label>{t("recurring:create.labels")}</Label>
							<div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
								{workspaceLabels.length === 0 ? (
									<span className="text-xs text-muted-foreground">
										{t("recurring:create.noLabels")}
									</span>
								) : (
									workspaceLabels.map(
										(label: { id: string; name: string; color: string }) => {
											const isSelected = labelIds.includes(label.id);
											return (
												<button
													key={label.id}
													type="button"
													className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-accent/50 rounded text-left"
													onClick={() => toggleLabel(label.id)}
												>
													<div
														className={`w-3 h-3 rounded-sm border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-input"}`}
													>
														{isSelected && (
															<Check className="w-2 h-2 text-primary-foreground" />
														)}
													</div>
													<span
														className="w-2 h-2 rounded-full shrink-0"
														style={{
															backgroundColor: getLabelColor(label.color),
														}}
													/>
													<span className="truncate">{label.name}</span>
												</button>
											);
										},
									)
								)}
							</div>
						</div>
						<div className="space-y-2">
							<Label>{t("recurring:create.checklist")}</Label>
							<div className="space-y-1">
								{checklistItems.map((item) => (
									<div key={item.tempId} className="flex items-center gap-2">
										<span className="flex-1 text-xs truncate px-2 py-1 border rounded bg-muted/50">
											{item.text}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="text-muted-foreground hover:text-destructive shrink-0"
											onClick={() => removeChecklistItem(item.tempId)}
										>
											<Trash2 className="size-3" />
										</Button>
									</div>
								))}
								<div className="flex items-center gap-2">
									<Input
										placeholder={t("recurring:create.checklistPlaceholder")}
										value={checklistInput}
										onChange={(e) => setChecklistInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addChecklistItem();
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addChecklistItem}
									>
										<Plus className="size-3.5" />
									</Button>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="rt-due-offset">
									{t("recurring:create.dueDateOffset")}
								</Label>
								<Input
									id="rt-due-offset"
									type="number"
									min={0}
									placeholder={t("recurring:create.dueDateOffsetPlaceholder")}
									value={dueDateDaysOffset ?? ""}
									onChange={(e) =>
										setDueDateDaysOffset(
											e.target.value ? Number(e.target.value) : undefined,
										)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="rt-next-run">
									{t("recurring:create.nextRunAt")}
								</Label>
								<Input
									id="rt-next-run"
									type="datetime-local"
									value={nextRunAtLocal}
									onChange={(e) => setNextRunAtLocal(e.target.value)}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="ghost">{t("common:actions.cancel")}</Button>
						</DialogClose>
						<Button type="submit" loading={isPending}>
							{isEditMode
								? t("recurring:edit.submit")
								: t("recurring:create.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default RecurringTaskDialog;
