import { AnimatePresence, motion } from "framer-motion";
import {
	CalendarIcon,
	Check,
	Circle,
	Clock,
	Columns,
	Plus,
	RefreshCw,
	Search,
	Tag,
	Trash2,
	UserIcon,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import useCreateLabel from "@/hooks/mutations/label/use-create-label";
import useGetLabelsByWorkspace from "@/hooks/queries/label/use-get-labels-by-workspace";
import { cn } from "@/lib/cn";
import { formatDateMedium } from "@/lib/format";
import { getPriorityIcon } from "@/lib/priority";

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
	users: {
		userId: string;
		user: { id: string; name: string | null; image?: string | null };
	}[];
	workspaceId: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	initialData?: RecurringTaskFormData & { id?: string };
};

type Priority = "no-priority" | "low" | "medium" | "high" | "urgent";

type LabelColor =
	| "gray"
	| "dark-gray"
	| "purple"
	| "teal"
	| "green"
	| "yellow"
	| "orange"
	| "pink"
	| "red";

type PopoverStep = "select" | "color";

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
	const [priority, setPriority] = useState<Priority>("no-priority");
	const [columnId, setColumnId] = useState("");
	const [assigneeId, setAssigneeId] = useState("");
	const [labelIds, setLabelIds] = useState<string[]>([]);
	const [dueDateDaysOffset, setDueDateDaysOffset] = useState<
		number | undefined
	>();
	const [nextRunAt, setNextRunAt] = useState<Date | undefined>(undefined);
	const [checklistItems, setChecklistItems] = useState<ChecklistEntry[]>([]);
	const [checklistInput, setChecklistInput] = useState("");

	const { mutateAsync: createLabel } = useCreateLabel();

	const [labelsOpen, setLabelsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [labelsStep, setLabelsStep] = useState<PopoverStep>("select");
	const [selectedColor, setSelectedColor] = useState<LabelColor>("gray");
	const [newLabelName, setNewLabelName] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);

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
				setPriority((initialData.priority as Priority) ?? "no-priority");
				setColumnId(initialData.columnId ?? "");
				setAssigneeId(initialData.assigneeId ?? "");
				setLabelIds(initialData.labelIds ?? []);
				setDueDateDaysOffset(initialData.dueDateDaysOffset);
				setNextRunAt(new Date(initialData.nextRunAt));
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
				setNextRunAt(new Date());
			}
		}
	}, [open, initialData]);

	useEffect(() => {
		if (labelsOpen && searchInputRef.current) {
			setTimeout(() => searchInputRef.current?.focus(), 100);
		}
	}, [labelsOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title) return;

		await onSubmit({
			title,
			description: description || undefined,
			frequency,
			intervalValue,
			columnId: columnId || undefined,
			assigneeId: assigneeId || undefined,
			priority: priority !== "no-priority" ? priority : undefined,
			nextRunAt: nextRunAt?.toISOString() ?? new Date().toISOString(),
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

	const priorityOptions = useMemo(
		() =>
			(["no-priority", "low", "medium", "high", "urgent"] as const).map(
				(value) => ({
					value,
					label: t(`tasks:priority.${value}`),
				}),
			),
		[t],
	);

	const frequencyOptions = useMemo(
		() =>
			(["daily", "weekly", "monthly"] as const).map((value) => ({
				value,
				label: t(`recurring:frequency.${value}`),
			})),
		[t],
	);

	const labelColors = useMemo(
		() =>
			[
				{
					value: "gray" as LabelColor,
					labelKey: "stone" as const,
					color: "var(--color-stone-500)",
				},
				{
					value: "dark-gray" as LabelColor,
					labelKey: "slate" as const,
					color: "var(--color-slate-500)",
				},
				{
					value: "purple" as LabelColor,
					labelKey: "lavender" as const,
					color: "var(--color-violet-500)",
				},
				{
					value: "teal" as LabelColor,
					labelKey: "sage" as const,
					color: "var(--color-emerald-600)",
				},
				{
					value: "green" as LabelColor,
					labelKey: "forest" as const,
					color: "var(--color-green-600)",
				},
				{
					value: "yellow" as LabelColor,
					labelKey: "amber" as const,
					color: "var(--color-amber-600)",
				},
				{
					value: "orange" as LabelColor,
					labelKey: "terracotta" as const,
					color: "var(--color-orange-600)",
				},
				{
					value: "pink" as LabelColor,
					labelKey: "rose" as const,
					color: "var(--color-rose-600)",
				},
				{
					value: "red" as LabelColor,
					labelKey: "crimson" as const,
					color: "var(--color-red-600)",
				},
			].map(({ labelKey, ...rest }) => ({
				...rest,
				label: t(`common:modals.createTask.labelColors.${labelKey}`),
			})),
		[t],
	);

	const selectedPriority = priorityOptions.find((p) => p.value === priority);
	const selectedFrequency = frequencyOptions.find((f) => f.value === frequency);
	const selectedColumn = columns.find((c) => c.id === columnId);
	const selectedUser = users.find((u) => u.userId === assigneeId);

	const filteredLabels = workspaceLabels.filter((label) =>
		label.name.toLowerCase().includes(searchValue.toLowerCase()),
	);

	const selectedLabels = workspaceLabels.filter((label) =>
		labelIds.includes(label.id),
	);

	const isCreatingNewLabel =
		searchValue &&
		!workspaceLabels.some(
			(label) => label.name.toLowerCase() === searchValue.toLowerCase(),
		);

	const resetLabelsPopover = () => {
		setLabelsStep("select");
		setSearchValue("");
		setNewLabelName("");
		setSelectedColor("gray");
	};

	const handleCreateNewClick = () => {
		setNewLabelName(searchValue);
		setLabelsStep("color");
	};

	const handleColorSelect = async (color: LabelColor) => {
		setSelectedColor(color);

		if (!newLabelName.trim()) return;

		try {
			const createdLabel = await createLabel({
				name: newLabelName.trim(),
				color: color,
				workspaceId,
			});

			setLabelIds((prev) => [...prev, createdLabel.id]);
			toast.success(t("common:modals.createTask.labelCreated"));
			resetLabelsPopover();
			setLabelsOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("common:modals.createTask.labelCreateError"),
			);
		}
	};

	const handleClose = () => {
		setOpen(false);
		resetLabelsPopover();
		setLabelsOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
				showCloseButton={false}
			>
				<DialogHeader className="shrink-0">
					<DialogTitle asChild>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="text-muted-foreground font-semibold tracking-wider text-sm">
									<RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
									{t("recurring:pageTitle").toUpperCase()}
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem className="text-foreground font-medium text-sm">
									{isEditMode
										? t("recurring:edit.title")
										: t("recurring:create.title")}
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</DialogTitle>
					<DialogDescription className="sr-only">
						{isEditMode
							? t("recurring:edit.description")
							: t("recurring:create.description")}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col flex-1 min-h-0 space-y-6"
				>
					<div className="flex-1 min-h-0 overflow-y-auto space-y-6 px-6">
						<Input
							unstyled
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
							placeholder={t("recurring:create.titlePlaceholder")}
							className="w-full **:data-[slot=input]:h-auto **:data-[slot=input]:px-0 **:data-[slot=input]:py-3 **:data-[slot=input]:text-2xl **:data-[slot=input]:leading-tight **:data-[slot=input]:font-semibold **:data-[slot=input]:tracking-tight **:data-[slot=input]:text-foreground **:data-[slot=input]:placeholder:text-muted-foreground **:data-[slot=input]:outline-none"
							required
						/>

						<div className="min-h-24">
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t("recurring:create.descriptionPlaceholder")}
								className="min-h-24 resize-none border-none shadow-none focus-visible:ring-0 px-0 text-sm"
							/>
						</div>

						{selectedLabels.length > 0 && (
							<div className="flex flex-wrap mb-2">
								{selectedLabels.map((label) => (
									<Badge
										key={label.id}
										variant="outline"
										className="flex items-center gap-1 pl-3 cursor-pointer hover:bg-accent/50 transition-colors"
										onClick={() => toggleLabel(label.id)}
									>
										<span
											className="inline-block w-2 h-2 mr-1.5 rounded-full"
											style={{
												backgroundColor: getLabelColor(label.color),
											}}
										/>
										<span className="max-w-20 truncate">{label.name}</span>
									</Badge>
								))}
							</div>
						)}

						{checklistItems.length > 0 && (
							<div className="space-y-0.5">
								<span className="text-xs font-medium text-muted-foreground">
									{t("recurring:create.checklist")}
								</span>
								<AnimatePresence initial={false}>
									{checklistItems.map((item) => (
										<motion.div
											key={item.tempId}
											layout
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{
												duration: 0.2,
												ease: "easeOut",
											}}
											className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent/50 group"
										>
											<Circle className="size-4 shrink-0 text-muted-foreground/40" />
											<span className="flex-1 text-sm truncate text-foreground/90">
												{item.text}
											</span>
											<button
												type="button"
												className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 outline-none"
												aria-label={t("common:actions.remove")}
												onClick={() => removeChecklistItem(item.tempId)}
											>
												<Trash2 className="size-3.5" />
											</button>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						)}

						<div className="flex flex-wrap items-center gap-2 py-2">
							{/* Frequency */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50 bg-accent/30 text-foreground"
									>
										<RefreshCw className="w-3.5 h-3.5" />
										<span>
											{intervalValue > 1
												? `${t("recurring:schedule.every")} ${intervalValue} ${selectedFrequency?.label}`
												: selectedFrequency?.label}
										</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-56 p-3" align="start">
									<div className="space-y-3">
										<div className="space-y-1.5">
											<span className="text-xs font-medium text-muted-foreground">
												{t("recurring:create.every")}
											</span>
											<Input
												type="number"
												min={1}
												value={intervalValue}
												onChange={(e) =>
													setIntervalValue(Number(e.target.value) || 1)
												}
												className="h-8"
											/>
										</div>
										<div className="space-y-1">
											{frequencyOptions.map((option) => (
												<button
													key={option.value}
													type="button"
													className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8 rounded-md"
													onClick={() => setFrequency(option.value)}
												>
													<span className="text-sm">{option.label}</span>
													{frequency === option.value && (
														<Check className="ml-auto h-4 w-4" />
													)}
												</button>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>

							{/* Column */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											selectedColumn
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										<Columns className="w-3.5 h-3.5" />
										<span>
											{selectedColumn?.name ??
												t("recurring:create.columnDefault")}
										</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-1" align="start">
									<div className="space-y-1">
										{columns.map((col) => (
											<button
												key={col.id}
												type="button"
												className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
												onClick={() => setColumnId(col.id)}
											>
												<span className="text-sm">{col.name}</span>
												{columnId === col.id && (
													<Check className="ml-auto h-4 w-4" />
												)}
											</button>
										))}
									</div>
								</PopoverContent>
							</Popover>

							{/* Priority */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											priority !== "no-priority"
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										{getPriorityIcon(priority)}
										<span>
											{selectedPriority
												? selectedPriority.label
												: t("recurring:create.priority")}
										</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-1" align="start">
									<div className="space-y-1">
										{priorityOptions.map((option) => (
											<button
												key={option.value}
												type="button"
												className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
												onClick={() => setPriority(option.value)}
											>
												{getPriorityIcon(option.value)}
												<span className="text-sm">{option.label}</span>
												{priority === option.value && (
													<Check className="ml-auto h-4 w-4" />
												)}
											</button>
										))}
									</div>
								</PopoverContent>
							</Popover>

							{/* Assignee */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											selectedUser
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										{selectedUser ? (
											<>
												<Avatar className="h-4 w-4">
													<AvatarImage
														src={selectedUser?.user?.image ?? ""}
														alt={selectedUser?.user?.name || ""}
													/>
													<AvatarFallback className="text-[10px] font-medium border border-border/30">
														{selectedUser?.user?.name
															?.charAt(0)
															.toUpperCase() || "?"}
													</AvatarFallback>
												</Avatar>
												<span>{selectedUser.user?.name}</span>
											</>
										) : (
											<>
												<UserIcon className="w-3.5 h-3.5" />
												<span>{t("recurring:create.assignee")}</span>
											</>
										)}
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-1" align="start">
									<div className="space-y-1">
										<button
											type="button"
											className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
											onClick={() => setAssigneeId("")}
										>
											<div
												className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center"
												title={t("recurring:create.assigneeUnassigned")}
											>
												<span className="text-[10px] font-medium text-muted-foreground">
													?
												</span>
											</div>
											<span className="text-sm">
												{t("recurring:create.assigneeUnassigned")}
											</span>
											{!assigneeId && <Check className="ml-auto h-4 w-4" />}
										</button>
										{users.map((member) => (
											<button
												key={member.userId}
												type="button"
												className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 text-left transition-colors h-8"
												onClick={() => setAssigneeId(member.userId || "")}
											>
												<Avatar className="h-6 w-6">
													<AvatarImage
														src={member?.user?.image ?? ""}
														alt={member?.user?.name || ""}
													/>
													<AvatarFallback className="text-xs font-medium border border-border/30">
														{member?.user?.name?.charAt(0).toUpperCase() || "?"}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm">{member?.user?.name}</span>
												{assigneeId === member.userId && (
													<Check className="ml-auto h-4 w-4" />
												)}
											</button>
										))}
									</div>
								</PopoverContent>
							</Popover>

							{/* Next Run At */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											nextRunAt
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										<CalendarIcon className="w-3.5 h-3.5" />
										<span>
											{nextRunAt
												? formatDateMedium(nextRunAt)
												: t("recurring:create.nextRunAt")}
										</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="p-0" align="start">
									<Calendar
										mode="single"
										selected={nextRunAt}
										onSelect={(date) => setNextRunAt(date)}
										className="w-full bg-popover"
									/>
									{nextRunAt && (
										<div className="pt-2 border-t border-border">
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
												onClick={() => setNextRunAt(undefined)}
											>
												<X className="h-4 w-4" />
												{t("common:modals.createTask.clearStartDate")}
											</Button>
										</div>
									)}
								</PopoverContent>
							</Popover>

							{/* Labels */}
							<Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											labelIds.length > 0
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										<Tag className="w-3.5 h-3.5" />
										<span>{t("recurring:create.labels")}</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="p-0" align="start">
									{labelsStep === "select" && (
										<div className="w-auto">
											<div className="flex items-center gap-2 p-2 border-b border-border">
												<Search className="w-3 h-3 text-muted-foreground" />
												<input
													ref={searchInputRef}
													value={searchValue}
													onChange={(e) => setSearchValue(e.target.value)}
													placeholder={t(
														"common:modals.createTask.searchLabels",
													)}
													className="w-full bg-transparent border-none text-foreground text-xs focus:outline-none placeholder:text-muted-foreground"
												/>
											</div>

											<div className="py-1 max-h-48 overflow-y-auto">
												{filteredLabels.length === 0 && (
													<span className="text-xs text-muted-foreground px-2 py-1.5 block">
														{t("recurring:create.noLabels")}
													</span>
												)}
												{filteredLabels.map((label) => (
													<button
														key={label.id}
														type="button"
														className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
														onClick={() => toggleLabel(label.id)}
													>
														<div className="shrink-0 w-3 flex justify-center">
															{labelIds.includes(label.id) && (
																<Check className="w-3 h-3" />
															)}
														</div>
														<span
															className="w-2 h-2 rounded-full shrink-0"
															style={{
																backgroundColor:
																	labelColors.find(
																		(c) => c.value === label.color,
																	)?.color || "var(--color-neutral-400)",
															}}
														/>
														<span className="max-w-28 truncate">
															{label.name}
														</span>
													</button>
												))}

												{isCreatingNewLabel && filteredLabels.length > 0 && (
													<div className="border-t border-border my-1" />
												)}
												{isCreatingNewLabel && (
													<button
														type="button"
														className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left"
														onClick={handleCreateNewClick}
													>
														<div className="shrink-0 w-3 flex justify-center">
															<Plus className="w-3 h-3" />
														</div>
														<span
															className="w-2 h-2 rounded-full shrink-0"
															style={{
																backgroundColor:
																	labelColors.find(
																		(c) => c.value === selectedColor,
																	)?.color || "var(--color-neutral-400)",
															}}
														/>
														<span className="truncate">
															{t("common:modals.createTask.createLabel", {
																name: searchValue,
															})}
														</span>
													</button>
												)}
											</div>
										</div>
									)}
									{labelsStep === "color" && (
										<div className="w-auto">
											<div className="flex items-center justify-between p-2 border-b border-border">
												<span className="text-xs font-medium">
													{t("common:modals.createTask.chooseColor")}
												</span>
												<button
													type="button"
													aria-label={t("common:actions.back")}
													onClick={() => setLabelsStep("select")}
													className="w-4 h-4 flex items-center justify-center hover:bg-accent/50 rounded"
												>
													<X className="h-3 w-3" />
												</button>
											</div>

											<div className="py-1">
												{labelColors.map((color) => (
													<button
														key={color.value}
														type="button"
														className={cn(
															"w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent/50 text-left",
															selectedColor === color.value && "bg-accent/30",
														)}
														onClick={() =>
															handleColorSelect(color.value as LabelColor)
														}
													>
														<span
															className="w-2 h-2 rounded-full shrink-0"
															style={{ backgroundColor: color.color }}
														/>
														<span className="truncate">{color.label}</span>
														{selectedColor === color.value && (
															<Check className="w-3 h-3 ml-auto" />
														)}
													</button>
												))}
											</div>
										</div>
									)}
								</PopoverContent>
							</Popover>

							{/* Due Date Offset */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											dueDateDaysOffset !== undefined
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										<Clock className="w-3.5 h-3.5" />
										<span>
											{dueDateDaysOffset !== undefined
												? `${dueDateDaysOffset} ${t("recurring:create.days")}`
												: t("recurring:create.dueDateOffset")}
										</span>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-48 p-3" align="start">
									<div className="space-y-2">
										<span className="text-xs font-medium text-muted-foreground">
											{t("recurring:create.dueDateOffset")}
										</span>
										<Input
											type="number"
											min={0}
											placeholder={t(
												"recurring:create.dueDateOffsetPlaceholder",
											)}
											value={dueDateDaysOffset ?? ""}
											onChange={(e) =>
												setDueDateDaysOffset(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
											className="h-8"
										/>
										{dueDateDaysOffset !== undefined && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
												onClick={() => setDueDateDaysOffset(undefined)}
											>
												<X className="h-4 w-4" />
												{t("common:actions.clear")}
											</Button>
										)}
									</div>
								</PopoverContent>
							</Popover>

							{/* Checklist */}
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={cn(
											"flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border border-border hover:bg-accent/50",
											checklistItems.length > 0
												? "bg-accent/30 text-foreground"
												: "text-muted-foreground",
										)}
									>
										<Plus className="w-3.5 h-3.5" />
										<span>{t("recurring:create.checklist")}</span>
										{checklistItems.length > 0 && (
											<span className="ml-0.5 text-[10px] bg-muted px-1 rounded">
												{checklistItems.length}
											</span>
										)}
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-64 p-3" align="start">
									<div className="space-y-2">
										<span className="text-xs font-medium text-muted-foreground">
											{t("recurring:create.checklist")}
										</span>
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
												className="h-8 flex-1"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="h-8 px-2"
												onClick={addChecklistItem}
											>
												<Plus className="size-3.5" />
											</Button>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-4">
						<Button
							type="button"
							onClick={handleClose}
							variant="outline"
							size="sm"
							className="border-border text-foreground hover:bg-accent"
						>
							{t("common:actions.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={!title.trim()}
							loading={isPending}
							size="sm"
							className="disabled:opacity-50"
						>
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
