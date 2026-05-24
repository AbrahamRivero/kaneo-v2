import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import WorkspaceLayout from "@/components/common/workspace-layout";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import useCreateContract from "@/hooks/mutations/supplier/use-create-contract";
import useCreateOrder from "@/hooks/mutations/supplier/use-create-order";
import useDeleteContract from "@/hooks/mutations/supplier/use-delete-contract";
import useDeleteOrder from "@/hooks/mutations/supplier/use-delete-order";
import useUpdateSupplier from "@/hooks/mutations/supplier/use-update-supplier";
import useGetSupplier from "@/hooks/queries/supplier/use-get-supplier";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/suppliers/$supplierId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId, supplierId } = Route.useParams();
	const navigate = useNavigate();
	const { data: supplier, isLoading } = useGetSupplier(supplierId);
	const updateSupplier = useUpdateSupplier(workspaceId);
	const createContract = useCreateContract(workspaceId);
	const deleteContract = useDeleteContract(workspaceId);
	const createOrder = useCreateOrder(workspaceId);
	const deleteOrder = useDeleteOrder(workspaceId);

	const [editOpen, setEditOpen] = useState(false);
	const [contractOpen, setContractOpen] = useState(false);
	const [orderOpen, setOrderOpen] = useState(false);
	const [editName, setEditName] = useState("");
	const [editContactName, setEditContactName] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editPhone, setEditPhone] = useState("");
	const [editWebsite, setEditWebsite] = useState("");
	const [editNotes, setEditNotes] = useState("");

	const [contractTitle, setContractTitle] = useState("");
	const [contractValue, setContractValue] = useState("");
	const [contractStatus, setContractStatus] = useState("draft");

	const [orderTitle, setOrderTitle] = useState("");
	const [orderAmount, setOrderAmount] = useState("");
	const [orderStatus, setOrderStatus] = useState("draft");

	if (isLoading) {
		return (
			<>
				<PageTitle title="Supplier" />
				<WorkspaceLayout title="Supplier">
					<div className="space-y-4 p-4">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-48 w-full" />
					</div>
				</WorkspaceLayout>
			</>
		);
	}

	if (!supplier) {
		return (
			<>
				<PageTitle title="Supplier" />
				<WorkspaceLayout title="Supplier">
					<Empty className="min-h-[40vh]">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Building2 />
							</EmptyMedia>
							<EmptyTitle>Supplier not found</EmptyTitle>
							<EmptyDescription>
								The supplier you're looking for doesn't exist.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</WorkspaceLayout>
			</>
		);
	}

	const openEdit = () => {
		setEditName(supplier.name);
		setEditContactName(supplier.contactName ?? "");
		setEditEmail(supplier.contactEmail ?? "");
		setEditPhone(supplier.contactPhone ?? "");
		setEditWebsite(supplier.website ?? "");
		setEditNotes(supplier.notes ?? "");
		setEditOpen(true);
	};

	const handleEdit = (e: React.FormEvent) => {
		e.preventDefault();
		updateSupplier.mutate({
			supplierId,
			data: {
				name: editName,
				contactName: editContactName || null,
				contactEmail: editEmail || null,
				contactPhone: editPhone || null,
				website: editWebsite || null,
				notes: editNotes || null,
			},
		});
		setEditOpen(false);
	};

	const handleCreateContract = (e: React.FormEvent) => {
		e.preventDefault();
		if (!contractTitle.trim()) return;
		createContract.mutate({
			supplierId,
			data: {
				workspaceId,
				title: contractTitle.trim(),
				...(contractValue && { value: contractValue }),
				status: contractStatus,
			},
		});
		setContractTitle("");
		setContractValue("");
		setContractStatus("draft");
		setContractOpen(false);
	};

	const handleCreateOrder = (e: React.FormEvent) => {
		e.preventDefault();
		if (!orderTitle.trim()) return;
		createOrder.mutate({
			supplierId,
			data: {
				workspaceId,
				title: orderTitle.trim(),
				...(orderAmount && { amount: orderAmount }),
				status: orderStatus,
			},
		});
		setOrderTitle("");
		setOrderAmount("");
		setOrderStatus("draft");
		setOrderOpen(false);
	};

	return (
		<>
			<PageTitle title={supplier.name} />
			<WorkspaceLayout title={supplier.name}>
				<div className="space-y-6 p-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							navigate({
								to: "/dashboard/workspace/$workspaceId/suppliers",
								params: { workspaceId },
							})
						}
					>
						<ArrowLeft className="mr-1 size-4" />
						Back to Suppliers
					</Button>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">Vendor Details</CardTitle>
							<Button variant="outline" size="sm" onClick={openEdit}>
								Edit
							</Button>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="text-xs text-muted-foreground">Contact</p>
								<p>{supplier.contactName ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Email</p>
								<p>{supplier.contactEmail ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Phone</p>
								<p>{supplier.contactPhone ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Website</p>
								<p>{supplier.website ?? "—"}</p>
							</div>
							{supplier.notes && (
								<div className="sm:col-span-2">
									<p className="text-xs text-muted-foreground">Notes</p>
									<p className="whitespace-pre-wrap">{supplier.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">
								Contracts ({supplier.contracts.length})
							</CardTitle>
							<Dialog open={contractOpen} onOpenChange={setContractOpen}>
								<DialogTrigger asChild>
									<Button size="sm">
										<Plus className="mr-1 size-4" />
										Add Contract
									</Button>
								</DialogTrigger>
								<DialogContent>
									<form onSubmit={handleCreateContract}>
										<DialogHeader>
											<DialogTitle>Add Contract</DialogTitle>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="ctitle">Title *</Label>
												<Input
													id="ctitle"
													value={contractTitle}
													onChange={(e) => setContractTitle(e.target.value)}
													required
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="cvalue">Value</Label>
												<Input
													id="cvalue"
													type="number"
													step="0.01"
													value={contractValue}
													onChange={(e) => setContractValue(e.target.value)}
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="cstatus">Status</Label>
												<select
													id="cstatus"
													className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
													value={contractStatus}
													onChange={(e) => setContractStatus(e.target.value)}
												>
													<option value="draft">Draft</option>
													<option value="active">Active</option>
													<option value="completed">Completed</option>
													<option value="terminated">Terminated</option>
												</select>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit">Create</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent className="p-0">
							{supplier.contracts.length === 0 ? (
								<div className="p-6 text-center text-sm text-muted-foreground">
									No contracts yet.
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Value</TableHead>
											<TableHead>Status</TableHead>
											<TableHead />
										</TableRow>
									</TableHeader>
									<TableBody>
										{supplier.contracts.map((c) => (
											<TableRow key={c.id}>
												<TableCell className="font-medium">{c.title}</TableCell>
												<TableCell>
													{c.value
														? `$${Number.parseFloat(c.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
														: "—"}
												</TableCell>
												<TableCell>
													<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize">
														{c.status}
													</span>
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => deleteContract.mutate(c.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-lg">
								Service Orders ({supplier.serviceOrders.length})
							</CardTitle>
							<Dialog open={orderOpen} onOpenChange={setOrderOpen}>
								<DialogTrigger asChild>
									<Button size="sm">
										<Plus className="mr-1 size-4" />
										Add Order
									</Button>
								</DialogTrigger>
								<DialogContent>
									<form onSubmit={handleCreateOrder}>
										<DialogHeader>
											<DialogTitle>Add Service Order</DialogTitle>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label htmlFor="otitle">Title *</Label>
												<Input
													id="otitle"
													value={orderTitle}
													onChange={(e) => setOrderTitle(e.target.value)}
													required
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="oamount">Amount</Label>
												<Input
													id="oamount"
													type="number"
													step="0.01"
													value={orderAmount}
													onChange={(e) => setOrderAmount(e.target.value)}
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="ostatus">Status</Label>
												<select
													id="ostatus"
													className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
													value={orderStatus}
													onChange={(e) => setOrderStatus(e.target.value)}
												>
													<option value="draft">Draft</option>
													<option value="ordered">Ordered</option>
													<option value="in-progress">In Progress</option>
													<option value="completed">Completed</option>
													<option value="cancelled">Cancelled</option>
												</select>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit">Create</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent className="p-0">
							{supplier.serviceOrders.length === 0 ? (
								<div className="p-6 text-center text-sm text-muted-foreground">
									No service orders yet.
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Project</TableHead>
											<TableHead />
										</TableRow>
									</TableHeader>
									<TableBody>
										{supplier.serviceOrders.map((o) => (
											<TableRow key={o.id}>
												<TableCell className="font-medium">{o.title}</TableCell>
												<TableCell>
													{o.amount
														? `$${Number.parseFloat(o.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
														: "—"}
												</TableCell>
												<TableCell>
													<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize">
														{o.status}
													</span>
												</TableCell>
												<TableCell className="text-muted-foreground">
													{o.project?.name ?? "—"}
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => deleteOrder.mutate(o.id)}
													>
														<Trash2 className="size-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					<Dialog open={editOpen} onOpenChange={setEditOpen}>
						<DialogContent>
							<form onSubmit={handleEdit}>
								<DialogHeader>
									<DialogTitle>Edit Vendor</DialogTitle>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="ename">Name *</Label>
										<Input
											id="ename"
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											required
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="econtact">Contact Name</Label>
										<Input
											id="econtact"
											value={editContactName}
											onChange={(e) => setEditContactName(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="eemail">Email</Label>
										<Input
											id="eemail"
											value={editEmail}
											onChange={(e) => setEditEmail(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="ephone">Phone</Label>
										<Input
											id="ephone"
											value={editPhone}
											onChange={(e) => setEditPhone(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="ewebsite">Website</Label>
										<Input
											id="ewebsite"
											value={editWebsite}
											onChange={(e) => setEditWebsite(e.target.value)}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="enotes">Notes</Label>
										<Textarea
											id="enotes"
											value={editNotes}
											onChange={(e) => setEditNotes(e.target.value)}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button type="submit">Save</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</WorkspaceLayout>
		</>
	);
}
