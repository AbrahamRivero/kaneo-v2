import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplate } from "@/hooks/mutations/template/use-create-template";
import useActiveWorkspace from "@/hooks/queries/workspace/use-active-workspace";
import { toast } from "@/lib/toast";

type TemplateColumnInput = {
	key: string;
	name: string;
	slug: string;
	position: number;
	isFinal: boolean;
};

type TemplateTaskInput = {
	key: string;
	title: string;
	description: string;
	columnSlug: string;
};

type CreateTemplateModalProps = {
	open: boolean;
	onClose: () => void;
};

function CreateTemplateModal({ open, onClose }: CreateTemplateModalProps) {
	const { data: workspace } = useActiveWorkspace();
	const workspaceId = workspace?.id ?? "";
	const createTemplate = useCreateTemplate(workspaceId);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [columns, setColumns] = useState<TemplateColumnInput[]>([
		{ key: "1", name: "To Do", slug: "to-do", position: 0, isFinal: false },
		{
			key: "2",
			name: "In Progress",
			slug: "in-progress",
			position: 1,
			isFinal: false,
		},
		{ key: "3", name: "Done", slug: "done", position: 2, isFinal: true },
	]);
	const [tasks, setTasks] = useState<TemplateTaskInput[]>([]);
	const [nextColKey, setNextColKey] = useState(4);
	const [nextTaskKey, setNextTaskKey] = useState(1);

	const handleAddColumn = () => {
		const key = String(nextColKey);
		setColumns((prev) => [
			...prev,
			{
				key,
				name: "",
				slug: "",
				position: prev.length,
				isFinal: false,
			},
		]);
		setNextColKey((k) => k + 1);
	};

	const handleRemoveColumn = (key: string) => {
		setColumns((prev) =>
			prev.filter((c) => c.key !== key).map((c, i) => ({ ...c, position: i })),
		);
	};

	const handleColumnChange = (
		key: string,
		field: keyof TemplateColumnInput,
		value: string | boolean,
	) => {
		setColumns((prev) =>
			prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)),
		);
	};

	const handleAddTask = () => {
		const key = String(nextTaskKey);
		setTasks((prev) => [
			...prev,
			{
				key,
				title: "",
				description: "",
				columnSlug: columns[0]?.slug ?? "",
			},
		]);
		setNextTaskKey((k) => k + 1);
	};

	const handleRemoveTask = (key: string) => {
		setTasks((prev) => prev.filter((t) => t.key !== key));
	};

	const handleTaskChange = (
		key: string,
		field: keyof TemplateTaskInput,
		value: string,
	) => {
		setTasks((prev) =>
			prev.map((t) => (t.key === key ? { ...t, [field]: value } : t)),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) return;
		if (columns.length === 0) return;

		try {
			await createTemplate.mutateAsync({
				workspaceId,
				name: name.trim(),
				description: description.trim() || undefined,
				columns: columns.map(
					({ key: _k, name: n, slug, position, isFinal }) => ({
						name: n,
						slug: slug || n.toLowerCase().replace(/\s+/g, "-"),
						position,
						isFinal,
					}),
				),
				tasks:
					tasks.length > 0
						? tasks
								.filter((t) => t.title.trim())
								.map(({ key: _k, title, description: d, columnSlug }) => ({
									title: title.trim(),
									description: d.trim() || undefined,
									columnSlug,
								}))
						: undefined,
			});

			toast.success("Template created");
			handleClose();
		} catch {
			toast.error("Failed to create template");
		}
	};

	const handleClose = () => {
		setName("");
		setDescription("");
		setColumns([
			{ key: "1", name: "To Do", slug: "to-do", position: 0, isFinal: false },
			{
				key: "2",
				name: "In Progress",
				slug: "in-progress",
				position: 1,
				isFinal: false,
			},
			{ key: "3", name: "Done", slug: "done", position: 2, isFinal: true },
		]);
		setTasks([]);
		setNextColKey(4);
		setNextTaskKey(1);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Template</DialogTitle>
					<DialogDescription>
						Define columns and optional sample tasks for this template.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4 px-6">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Agile Sprint"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Brief description of this template"
								className="resize-none"
								rows={2}
							/>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Columns</Label>
								<Button
									type="button"
									variant="outline"
									size="xs"
									onClick={handleAddColumn}
								>
									<Plus className="size-3 mr-1" />
									Add Column
								</Button>
							</div>

							{columns.map((col, i) => (
								<div
									key={col.key}
									className="flex items-start gap-2 rounded-lg border p-3"
								>
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground w-4">
												#{i + 1}
											</span>
											<Input
												value={col.name}
												onChange={(e) =>
													handleColumnChange(col.key, "name", e.target.value)
												}
												placeholder="Column name"
												className="h-8 text-sm"
											/>
										</div>
										<div className="flex items-center gap-2">
											<Input
												value={col.slug}
												onChange={(e) =>
													handleColumnChange(col.key, "slug", e.target.value)
												}
												placeholder="column-slug"
												className="h-7 text-xs font-mono"
											/>
											<label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
												<input
													type="checkbox"
													checked={col.isFinal}
													onChange={(e) =>
														handleColumnChange(
															col.key,
															"isFinal",
															e.target.checked,
														)
													}
												/>
												Final
											</label>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="text-muted-foreground hover:text-destructive mt-1"
										onClick={() => handleRemoveColumn(col.key)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Sample Tasks (optional)</Label>
								<Button
									type="button"
									variant="outline"
									size="xs"
									onClick={handleAddTask}
								>
									<Plus className="size-3 mr-1" />
									Add Task
								</Button>
							</div>

							{tasks.length === 0 && (
								<p className="text-xs text-muted-foreground">
									No sample tasks. The template will only define columns.
								</p>
							)}

							{tasks.map((task) => (
								<div
									key={task.key}
									className="flex items-start gap-2 rounded-lg border p-3"
								>
									<div className="flex-1 space-y-2">
										<Input
											value={task.title}
											onChange={(e) =>
												handleTaskChange(task.key, "title", e.target.value)
											}
											placeholder="Task title"
											className="h-8 text-sm"
										/>
										<Input
											value={task.description}
											onChange={(e) =>
												handleTaskChange(
													task.key,
													"description",
													e.target.value,
												)
											}
											placeholder="Description (optional)"
											className="h-7 text-xs"
										/>
										<Select
											value={task.columnSlug}
											onValueChange={(v) =>
												handleTaskChange(task.key, "columnSlug", v ?? "")
											}
										>
											<SelectTrigger className="h-7 text-xs">
												<SelectValue placeholder="Column" />
											</SelectTrigger>
											<SelectContent>
												{columns
													.filter((c) => c.name)
													.map((c) => (
														<SelectItem key={c.key} value={c.slug}>
															{c.name}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										className="text-muted-foreground hover:text-destructive mt-1"
										onClick={() => handleRemoveTask(task.key)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={!name.trim() || columns.length === 0}
							loading={createTemplate.isPending}
						>
							Create Template
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTemplateModal;
