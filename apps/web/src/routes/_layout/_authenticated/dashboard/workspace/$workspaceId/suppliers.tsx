import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, FileText, Plus, ShoppingCart } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useCreateSupplier from "@/hooks/mutations/supplier/use-create-supplier";
import useDeleteContract from "@/hooks/mutations/supplier/use-delete-contract";
import useDeleteOrder from "@/hooks/mutations/supplier/use-delete-order";
import useDeleteSupplier from "@/hooks/mutations/supplier/use-delete-supplier";
import useListContracts from "@/hooks/queries/supplier/use-list-contracts";
import useListOrders from "@/hooks/queries/supplier/use-list-orders";
import useListSuppliers from "@/hooks/queries/supplier/use-list-suppliers";

export const Route = createFileRoute(
	"/_layout/_authenticated/dashboard/workspace/$workspaceId/suppliers",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("vendors");

	const { data: suppliers, isLoading: loadingSuppliers } =
		useListSuppliers(workspaceId);
	const { data: contracts, isLoading: loadingContracts } =
		useListContracts(workspaceId);
	const { data: orders, isLoading: loadingOrders } = useListOrders(workspaceId);

	const createSupplier = useCreateSupplier(workspaceId);
	const deleteSupplier = useDeleteSupplier(workspaceId);
	const deleteContract = useDeleteContract(workspaceId);
	const deleteOrder = useDeleteOrder(workspaceId);

	const totalSuppliers = suppliers?.length ?? 0;
	const totalContracts = contracts?.length ?? 0;
	const totalOrders = orders?.length ?? 0;

	if (loadingSuppliers || loadingContracts || loadingOrders) {
		return (
			<>
				<PageTitle title="Suppliers" />
				<WorkspaceLayout title="Suppliers">
					<div className="space-y-4 p-4">
						<div className="grid gap-4 sm:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader className="pb-2">
										<Skeleton className="h-4 w-20" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-8 w-24" />
									</CardContent>
								</Card>
							))}
						</div>
						<Skeleton className="h-64 w-full" />
					</div>
				</WorkspaceLayout>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Suppliers" />
			<WorkspaceLayout title="Suppliers">
				<div className="space-y-6 p-4">
					<div className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Vendors
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<Building2 className="size-5 text-muted-foreground" />
									<p className="text-2xl font-bold">{totalSuppliers}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Total Contracts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<FileText className="size-5 text-muted-foreground" />
									<p className="text-2xl font-bold">{totalContracts}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-muted-foreground">
									Service Orders
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<ShoppingCart className="size-5 text-muted-foreground" />
									<p className="text-2xl font-bold">{totalOrders}</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList>
							<TabsTrigger value="vendors">Vendors</TabsTrigger>
							<TabsTrigger value="contracts">Contracts</TabsTrigger>
							<TabsTrigger value="orders">Service Orders</TabsTrigger>
						</TabsList>

						<TabsContent value="vendors" className="space-y-4">
							<div className="flex justify-end">
								<AddSupplierDialog
									onCreate={(data) => createSupplier.mutateAsync(data)}
								/>
							</div>
							{!suppliers || suppliers.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<Building2 />
										</EmptyMedia>
										<EmptyTitle>No vendors yet</EmptyTitle>
										<EmptyDescription>
											Add a vendor to start tracking suppliers.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Name</TableHead>
													<TableHead>Contact</TableHead>
													<TableHead>Email</TableHead>
													<TableHead>Contracts</TableHead>
													<TableHead>Orders</TableHead>
													<TableHead />
												</TableRow>
											</TableHeader>
											<TableBody>
												{suppliers.map((s) => (
													<TableRow
														key={s.id}
														className="cursor-pointer"
														onClick={() =>
															navigate({
																to: "/dashboard/workspace/$workspaceId/suppliers/$supplierId",
																params: {
																	workspaceId,
																	supplierId: s.id,
																},
															})
														}
													>
														<TableCell className="font-medium">
															{s.name}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{s.contactName ?? "—"}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{s.contactEmail ?? "—"}
														</TableCell>
														<TableCell>{s.contractCount}</TableCell>
														<TableCell>{s.orderCount}</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	deleteSupplier.mutate(s.id);
																}}
															>
																Delete
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="contracts" className="space-y-4">
							{!contracts || contracts.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<FileText />
										</EmptyMedia>
										<EmptyTitle>No contracts yet</EmptyTitle>
										<EmptyDescription>
											Create a contract from a vendor's detail page.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Title</TableHead>
													<TableHead>Vendor</TableHead>
													<TableHead>Value</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Period</TableHead>
													<TableHead />
												</TableRow>
											</TableHeader>
											<TableBody>
												{contracts.map((c) => (
													<TableRow key={c.id}>
														<TableCell className="font-medium">
															{c.title}
														</TableCell>
														<TableCell>{c.supplier.name}</TableCell>
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
														<TableCell className="text-xs text-muted-foreground">
															{c.startDate
																? new Date(c.startDate).toLocaleDateString()
																: "—"}
															{c.endDate
																? ` → ${new Date(c.endDate).toLocaleDateString()}`
																: ""}
														</TableCell>
														<TableCell>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => deleteContract.mutate(c.id)}
															>
																Delete
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="orders" className="space-y-4">
							{!orders || orders.length === 0 ? (
								<Empty className="min-h-[30vh]">
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<ShoppingCart />
										</EmptyMedia>
										<EmptyTitle>No service orders yet</EmptyTitle>
										<EmptyDescription>
											Create a service order from a vendor's detail page.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							) : (
								<Card>
									<CardContent className="p-0">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Title</TableHead>
													<TableHead>Vendor</TableHead>
													<TableHead>Amount</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Project</TableHead>
													<TableHead />
												</TableRow>
											</TableHeader>
											<TableBody>
												{orders.map((o) => (
													<TableRow key={o.id}>
														<TableCell className="font-medium">
															{o.title}
														</TableCell>
														<TableCell>{o.supplier.name}</TableCell>
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
																Delete
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</WorkspaceLayout>
		</>
	);
}

function AddSupplierDialog({
	onCreate,
}: {
	onCreate: (data: {
		name: string;
		contactName?: string;
		contactEmail?: string;
		contactPhone?: string;
		website?: string;
		notes?: string;
	}) => void;
}) {
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
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add Vendor</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="contactName">Contact Name</Label>
							<Input
								id="contactName"
								value={contactName}
								onChange={(e) => setContactName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="contactEmail">Email</Label>
							<Input
								id="contactEmail"
								type="email"
								value={contactEmail}
								onChange={(e) => setContactEmail(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="contactPhone">Phone</Label>
							<Input
								id="contactPhone"
								value={contactPhone}
								onChange={(e) => setContactPhone(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="website">Website</Label>
							<Input
								id="website"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
